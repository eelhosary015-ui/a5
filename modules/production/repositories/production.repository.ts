import { erpPool } from "../../../server-erp-core.js";
import { 
  CreateProductionRunDTO, 
  ExecuteProductionOrderDTO, 
  CheckAvailabilityResponse, 
  CheckAvailabilityItemResult 
} from "../dto/production.dto.js";
import { applyStockMovement } from "../../warehouses/warehouses_api.routes.js";

export class ProductionRepository {
  private initialized: boolean = false;

  constructor() {
    this.ensureTableExists();
  }

  private async ensureTableExists(): Promise<void> {
    if (this.initialized) return;

    try {
      // 1. Production Runs Table
      await erpPool.query(`
        CREATE TABLE IF NOT EXISTS production_runs (
          id SERIAL PRIMARY KEY,
          order_number VARCHAR(100),
          product_id INTEGER,
          warehouse_id INTEGER,
          finished_warehouse_id INTEGER,
          quantity DECIMAL(12,2) NOT NULL,
          status TEXT DEFAULT 'completed',
          total_cost DECIMAL(12,2) DEFAULT 0,
          unit_cost DECIMAL(12,2) DEFAULT 0,
          bom_id TEXT,
          bom_snapshot TEXT,
          notes TEXT,
          executed_by TEXT,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 2. Production Orders Table
      await erpPool.query(`
        CREATE TABLE IF NOT EXISTS production_orders (
          id SERIAL PRIMARY KEY,
          order_number VARCHAR(100) UNIQUE NOT NULL,
          product_id VARCHAR(100) NOT NULL,
          product_name VARCHAR(255),
          quantity DECIMAL(12,2) NOT NULL DEFAULT 1,
          bom_id VARCHAR(100),
          raw_warehouse_id INTEGER,
          finished_warehouse_id INTEGER,
          start_date VARCHAR(50),
          end_date VARCHAR(50),
          priority VARCHAR(50) DEFAULT 'normal',
          status VARCHAR(50) DEFAULT 'planned',
          progress INTEGER DEFAULT 0,
          sales_reference VARCHAR(100),
          work_center_id VARCHAR(100),
          supervisor VARCHAR(100),
          notes TEXT,
          bom_snapshot TEXT,
          total_cost DECIMAL(12,2) DEFAULT 0,
          cost_per_unit DECIMAL(12,2) DEFAULT 0,
          executed_by VARCHAR(100),
          executed_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 3. Production BOMs Table
      await erpPool.query(`
        CREATE TABLE IF NOT EXISTS production_boms (
          id VARCHAR(100) PRIMARY KEY,
          product_id VARCHAR(100) NOT NULL,
          name VARCHAR(255) NOT NULL,
          version VARCHAR(50) DEFAULT 'v1.0',
          scrap_percentage DECIMAL(5,2) DEFAULT 0,
          items_json TEXT NOT NULL,
          routings_json TEXT,
          total_cost DECIMAL(12,2) DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Alter columns safely if they were created earlier
      try {
        await erpPool.query("ALTER TABLE production_runs ADD COLUMN IF NOT EXISTS order_number VARCHAR(100)");
        await erpPool.query("ALTER TABLE production_runs ADD COLUMN IF NOT EXISTS finished_warehouse_id INTEGER");
        await erpPool.query("ALTER TABLE production_runs ADD COLUMN IF NOT EXISTS total_cost DECIMAL(12,2) DEFAULT 0");
        await erpPool.query("ALTER TABLE production_runs ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(12,2) DEFAULT 0");
        await erpPool.query("ALTER TABLE production_runs ADD COLUMN IF NOT EXISTS bom_id TEXT");
        await erpPool.query("ALTER TABLE production_runs ADD COLUMN IF NOT EXISTS bom_snapshot TEXT");
        await erpPool.query("ALTER TABLE production_runs ADD COLUMN IF NOT EXISTS executed_by TEXT");
        await erpPool.query("ALTER TABLE production_runs ADD COLUMN IF NOT EXISTS executed_at TIMESTAMP");
        await erpPool.query("ALTER TABLE production_orders ADD COLUMN IF NOT EXISTS is_executed BOOLEAN DEFAULT false");
        await erpPool.query("ALTER TABLE production_orders ADD COLUMN IF NOT EXISTS executed_by VARCHAR(100)");
        await erpPool.query("ALTER TABLE production_orders ADD COLUMN IF NOT EXISTS executed_at TIMESTAMP");
        await erpPool.query("ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS reserved DECIMAL(14,4) DEFAULT 0");
        await erpPool.query("ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS in_transit DECIMAL(14,4) DEFAULT 0");
        await erpPool.query("ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS available DECIMAL(14,4) DEFAULT 0");
        await erpPool.query("UPDATE inventory_items SET available = GREATEST(COALESCE(quantity,0) - COALESCE(reserved,0), 0)");
        
        await erpPool.query("ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS code TEXT");
        await erpPool.query("ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS item_code TEXT");
        await erpPool.query("ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS category TEXT");
        await erpPool.query("ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS avg_cost DECIMAL(14,4) DEFAULT 0");
        await erpPool.query("ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS last_purchase_price DECIMAL(14,4) DEFAULT 0");
        await erpPool.query("ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS current_stock DECIMAL(14,4) DEFAULT 0");
        await erpPool.query("ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS min_stock DECIMAL(12,3) DEFAULT 0");
        await erpPool.query("ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS is_manufactured INTEGER DEFAULT 0");
        await erpPool.query("ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS avg_cost DECIMAL(14,4) DEFAULT 0");
        await erpPool.query("ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS cost DECIMAL(14,4) DEFAULT 0");
        // The production sync must use the actual products schema. Some older
        // databases have neither `active` nor `is_active`; create the canonical
        // column once and never write to the obsolete `active` column.
        try { await erpPool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true"); } catch (_) {}

        // IMPORTANT: repair legacy INTEGER cost/quantity columns instead of merely
        // adding missing columns. PostgreSQL error 22P02 occurs when a decimal such
        // as 10.15 is sent to an INTEGER column. The helper also removes an old
        // incompatible default before changing the type, then restores a numeric
        // default. Each column is repaired independently so one legacy column cannot
        // prevent the remaining production schema repairs from running.
        const repairDecimalColumn = async (table: string, column: string, precision: string, defaultValue = '0') => {
          try {
            await erpPool.query(`ALTER TABLE ${table} ALTER COLUMN ${column} DROP DEFAULT`);
          } catch (_) {}
          try {
            await erpPool.query(
              `ALTER TABLE ${table} ALTER COLUMN ${column} TYPE NUMERIC(${precision}) USING COALESCE(NULLIF(TRIM(${column}::text), ''), '0')::numeric`
            );
          } catch (err: any) {
            console.error(`[Production Schema] Failed to convert ${table}.${column} to NUMERIC:`, err?.message || err);
            throw err;
          }
          try {
            await erpPool.query(`ALTER TABLE ${table} ALTER COLUMN ${column} SET DEFAULT ${defaultValue}`);
          } catch (_) {}
        };

        for (const [table, column, precision] of [
          ['ingredients', 'cost', '14,4'],
          ['ingredients', 'avg_cost', '14,4'],
          ['ingredients', 'last_purchase_price', '14,4'],
          ['ingredients', 'current_stock', '14,4'],
          ['ingredients', 'min_stock', '12,3'],
          ['inventory_items', 'quantity', '14,4'],
          ['inventory_items', 'min_quantity', '14,4'],
          ['inventory_items', 'reserved', '14,4'],
          ['inventory_items', 'in_transit', '14,4'],
          ['inventory_items', 'available', '14,4'],
          ['inventory_items', 'avg_cost', '14,4'],
          ['inventory_items', 'cost', '14,4']
        ] as const) {
          // Repair each legacy column independently. One optional legacy column
          // must never prevent the remaining production schema from being fixed.
          try { await repairDecimalColumn(table, column, precision); } catch (err: any) {
            console.warn(`[Production Schema] Skipped ${table}.${column}:`, err?.message || err);
          }
        }
      } catch (_) {}

      this.initialized = true;
    } catch (err: any) {
      console.error("Failed to ensure production tables exist:", err.message);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // PRODUCTION RUNS
  // ─────────────────────────────────────────────────────────────
  async getAll(): Promise<any[]> {
    await this.ensureTableExists();
    const query = `
      SELECT pr.*, p.name as product_name, w.name as warehouse_name, fw.name as finished_warehouse_name
      FROM production_runs pr
      LEFT JOIN products p ON pr.product_id = p.id
      LEFT JOIN warehouses w ON pr.warehouse_id = w.id
      LEFT JOIN warehouses fw ON pr.finished_warehouse_id = fw.id
      ORDER BY pr.created_at DESC
    `;
    const result = await erpPool.query(query);
    return result.rows;
  }

  async findById(id: number): Promise<any> {
    await this.ensureTableExists();
    const query = `
      SELECT pr.*, p.name as product_name, w.name as warehouse_name, fw.name as finished_warehouse_name
      FROM production_runs pr
      LEFT JOIN products p ON pr.product_id = p.id
      LEFT JOIN warehouses w ON pr.warehouse_id = w.id
      LEFT JOIN warehouses fw ON pr.finished_warehouse_id = fw.id
      WHERE pr.id = $1
    `;
    const result = await erpPool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // ─────────────────────────────────────────────────────────────
  // BOM / RECIPES REPOSITORY
  // ─────────────────────────────────────────────────────────────
  async getBOMs(): Promise<any[]> {
    await this.ensureTableExists();
    try {
      const res = await erpPool.query("SELECT * FROM production_boms ORDER BY created_at DESC");
      if (res.rows.length > 0) {
        return res.rows.map((row: any) => ({
          id: row.id,
          productId: row.product_id,
          name: row.name,
          version: row.version,
          scrapPercentage: parseFloat(row.scrap_percentage) || 0,
          totalCost: parseFloat(row.total_cost) || 0,
          items: typeof row.items_json === 'string' ? JSON.parse(row.items_json || '[]') : (row.items_json || []),
          routings: typeof row.routings_json === 'string' ? JSON.parse(row.routings_json || '[]') : (row.routings_json || [])
        }));
      }
    } catch (e) {
      console.warn("Failed to query production_boms from database, using fallback:", e);
    }
    return [];
  }

  async saveBOM(bom: any): Promise<any> {
    await this.ensureTableExists();
    const bomId = bom.id || `bom-${Date.now()}`;
    const itemsJson = JSON.stringify(bom.items || []);
    const routingsJson = JSON.stringify(bom.routings || []);
    const scrap = Number(bom.scrapPercentage) || 0;
    const totalCost = Number(bom.totalCost) || 0;

    const query = `
      INSERT INTO production_boms (id, product_id, name, version, scrap_percentage, items_json, routings_json, total_cost)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id)
      DO UPDATE SET
        product_id = EXCLUDED.product_id,
        name = EXCLUDED.name,
        version = EXCLUDED.version,
        scrap_percentage = EXCLUDED.scrap_percentage,
        items_json = EXCLUDED.items_json,
        routings_json = EXCLUDED.routings_json,
        total_cost = EXCLUDED.total_cost,
        updated_at = NOW()
      RETURNING *
    `;

    const res = await erpPool.query(query, [
      bomId,
      String(bom.productId || ''),
      bom.name || 'وصفة تصنيع',
      bom.version || 'v1.0',
      scrap,
      itemsJson,
      routingsJson,
      totalCost
    ]);

    // Also sync with product_ingredients for backward compatibility with restaurant/recipes module
    const numericProdId = parseInt(String(bom.productId).replace(/[^0-9]/g, ''));
    if (!isNaN(numericProdId) && numericProdId > 0 && Array.isArray(bom.items)) {
      try {
        await erpPool.query("DELETE FROM product_ingredients WHERE product_id = $1", [numericProdId]);
        for (const it of bom.items) {
          const ingId = parseInt(String(it.materialId).replace(/[^0-9]/g, ''));
          if (!isNaN(ingId) && ingId > 0) {
            await erpPool.query(
              "INSERT INTO product_ingredients (product_id, ingredient_id, quantity, waste_percent) VALUES ($1, $2, $3, $4)",
              [numericProdId, ingId, Number(it.quantity) || 1, scrap]
            );
          }
        }
      } catch (err) {
        console.warn("Could not sync product_ingredients:", err);
      }
    }

    return res.rows[0] || bom;
  }

  // ─────────────────────────────────────────────────────────────
  // PRODUCTION ORDERS REPOSITORY
  // ─────────────────────────────────────────────────────────────
  async getOrders(): Promise<any[]> {
    await this.ensureTableExists();
    try {
      const res = await erpPool.query("SELECT * FROM production_orders ORDER BY created_at DESC");
      if (res.rows.length > 0) {
        return res.rows.map((row: any) => ({
          id: String(row.id),
          orderNumber: row.order_number,
          productId: row.product_id,
          productName: row.product_name,
          quantity: parseFloat(row.quantity) || 0,
          bomId: row.bom_id,
          rawWarehouseId: row.raw_warehouse_id,
          finishedWarehouseId: row.finished_warehouse_id,
          startDate: row.start_date,
          endDate: row.end_date,
          priority: row.priority,
          status: row.status,
          progress: parseInt(row.progress) || 0,
          salesReference: row.sales_reference,
          workCenterId: row.work_center_id,
          supervisor: row.supervisor,
          notes: row.notes,
          bomSnapshot: typeof row.bom_snapshot === 'string' ? JSON.parse(row.bom_snapshot || '{}') : (row.bom_snapshot || {}),
          totalCost: parseFloat(row.total_cost) || 0,
          costPerUnit: parseFloat(row.cost_per_unit) || 0,
          executedBy: row.executed_by,
          executedAt: row.executed_at,
          createdAt: row.created_at
        }));
      }
    } catch (e) {
      console.warn("Failed to load production_orders from database, checking settings:", e);
    }
    return [];
  }

  async saveOrder(order: any): Promise<any> {
    await this.ensureTableExists();
    const orderNumber = order.orderNumber || `PRD-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const snapshotStr = JSON.stringify(order.bomSnapshot || {});
    const qty = Number(order.quantity) || 1;
    const totalCost = Number(order.totalCost) || 0;
    const costPerUnit = qty > 0 ? totalCost / qty : 0;

    const query = `
      INSERT INTO production_orders (
        order_number, product_id, product_name, quantity, bom_id,
        raw_warehouse_id, finished_warehouse_id, start_date, end_date,
        priority, status, progress, sales_reference, work_center_id,
        supervisor, notes, bom_snapshot, total_cost, cost_per_unit
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      ON CONFLICT (order_number)
      DO UPDATE SET
        product_id = EXCLUDED.product_id,
        product_name = EXCLUDED.product_name,
        quantity = EXCLUDED.quantity,
        bom_id = EXCLUDED.bom_id,
        raw_warehouse_id = EXCLUDED.raw_warehouse_id,
        finished_warehouse_id = EXCLUDED.finished_warehouse_id,
        start_date = EXCLUDED.start_date,
        end_date = EXCLUDED.end_date,
        priority = EXCLUDED.priority,
        status = EXCLUDED.status,
        progress = EXCLUDED.progress,
        sales_reference = EXCLUDED.sales_reference,
        work_center_id = EXCLUDED.work_center_id,
        supervisor = EXCLUDED.supervisor,
        notes = EXCLUDED.notes,
        bom_snapshot = EXCLUDED.bom_snapshot,
        total_cost = EXCLUDED.total_cost,
        cost_per_unit = EXCLUDED.cost_per_unit,
        updated_at = NOW()
      RETURNING *
    `;

    const res = await erpPool.query(query, [
      orderNumber,
      String(order.productId || ''),
      order.productName || '',
      qty,
      order.bomId || '',
      order.rawWarehouseId || null,
      order.finishedWarehouseId || null,
      order.startDate || '',
      order.endDate || '',
      order.priority || 'normal',
      order.status || 'planned',
      order.progress || 0,
      order.salesReference || '',
      order.workCenterId || '',
      order.supervisor || '',
      order.notes || '',
      snapshotStr,
      totalCost,
      costPerUnit
    ]);

    return res.rows[0];
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK MATERIAL AVAILABILITY IN REAL-TIME
  // ─────────────────────────────────────────────────────────────
  async checkAvailability(
    productId: string | number,
    bomId: string | undefined,
    quantity: number,
    rawWarehouseId: number
  ): Promise<CheckAvailabilityResponse> {
    await this.ensureTableExists();
    const qty = Math.max(1, Number(quantity) || 1);

    // 1. Get warehouse name
    const whRes = await erpPool.query("SELECT name FROM warehouses WHERE id = $1", [rawWarehouseId]);
    const rawWarehouseName = whRes.rows[0]?.name || `مخزن #${rawWarehouseId}`;

    // 2. Resolve Product Details
    let productName = `منتج #${productId}`;
    const prodRes = await erpPool.query(
      "SELECT id, name, code, unit, cost, price FROM products WHERE id::text = $1::text OR code::text = $1::text",
      [String(productId)]
    );
    if (prodRes.rows.length > 0) {
      productName = prodRes.rows[0].name;
    }

    // 3. Resolve BOM and items
    let bomItems: Array<{ materialId: any; quantity: number }> = [];
    let scrapPercentage = 0;

    if (bomId) {
      const bomRes = await erpPool.query("SELECT * FROM production_boms WHERE id::text = $1::text", [String(bomId)]);
      if (bomRes.rows.length > 0) {
        const b = bomRes.rows[0];
        scrapPercentage = parseFloat(b.scrap_percentage) || 0;
        if (b.items_json) {
          try { bomItems = typeof b.items_json === 'string' ? JSON.parse(b.items_json) : (b.items_json || []); } catch (_) { bomItems = []; }
        }
        // Legacy/enterprise schema stores BOM lines in bom_items instead of items_json.
        if (!Array.isArray(bomItems) || bomItems.length === 0) {
          const biRes = await erpPool.query(
            `SELECT bi.ingredient_id, bi.quantity, bi.unit, bi.unit_cost, i.name AS ingredient_name,
                    i.code AS ingredient_code
             FROM bom_items bi
             LEFT JOIN ingredients i ON i.id = bi.ingredient_id
             WHERE bi.bom_id::text = $1::text
             ORDER BY bi.sort_order, bi.id`,
            [String(b.id)]
          );
          bomItems = biRes.rows.map((r: any) => ({
            materialId: r.ingredient_id,
            ingredientId: r.ingredient_id,
            materialName: r.ingredient_name,
            code: r.ingredient_code,
            quantity: Number(r.quantity) || 0,
            quantityPerUnit: Number(r.quantity) || 0,
            unit: r.unit,
            unitCost: Number(r.unit_cost) || 0
          }));
        }
      }
    }

    // If no BOM items found yet, check by product_id
    if (bomItems.length === 0) {
      const bomByProd = await erpPool.query("SELECT * FROM production_boms WHERE product_id::text = $1::text LIMIT 1", [String(productId)]);
      if (bomByProd.rows.length > 0) {
        const b = bomByProd.rows[0];
        scrapPercentage = parseFloat(b.scrap_percentage) || 0;
        if (b.items_json) {
          try { bomItems = typeof b.items_json === 'string' ? JSON.parse(b.items_json) : (b.items_json || []); } catch (_) { bomItems = []; }
        }
        if (!Array.isArray(bomItems) || bomItems.length === 0) {
          const biRes = await erpPool.query(
            `SELECT bi.ingredient_id, bi.quantity, bi.unit, bi.unit_cost, i.name AS ingredient_name,
                    i.code AS ingredient_code
             FROM bom_items bi
             LEFT JOIN ingredients i ON i.id = bi.ingredient_id
             WHERE bi.bom_id::text = $1::text
             ORDER BY bi.sort_order, bi.id`,
            [String(b.id)]
          );
          bomItems = biRes.rows.map((r: any) => ({
            materialId: r.ingredient_id,
            ingredientId: r.ingredient_id,
            materialName: r.ingredient_name,
            code: r.ingredient_code,
            quantity: Number(r.quantity) || 0,
            quantityPerUnit: Number(r.quantity) || 0,
            unit: r.unit,
            unitCost: Number(r.unit_cost) || 0
          }));
        }
      }
    }

    // If still no items, fallback to product_ingredients
    if (bomItems.length === 0 && prodRes.rows.length > 0) {
      const numProdId = prodRes.rows[0].id;
      const piRes = await erpPool.query("SELECT ingredient_id, quantity, waste_percent FROM product_ingredients WHERE product_id::text = $1::text", [String(numProdId)]);
      if (piRes.rows.length > 0) {
        bomItems = piRes.rows.map((r: any) => ({
          materialId: r.ingredient_id,
          quantity: parseFloat(r.quantity) || 1
        }));
        scrapPercentage = parseFloat(piRes.rows[0].waste_percent) || 0;
      }
    }

    // 4. Fetch all ingredients to cross-reference
    const allIngredientsRes = await erpPool.query("SELECT id, name, code, unit, cost, avg_cost, last_purchase_price FROM ingredients");
    const ingredientsList = allIngredientsRes.rows;

    // 5. Fetch current stock in the rawWarehouseId
    const stockRes = await erpPool.query("SELECT ingredient_id, quantity, reserved FROM inventory_items WHERE warehouse_id = $1", [rawWarehouseId]);
    const stockMap: Record<number, number> = {};
    stockRes.rows.forEach((row: any) => {
      const quantityInWarehouse = Number(row.quantity) || 0;
      const reserved = Number(row.reserved) || 0;
      stockMap[Number(row.ingredient_id)] = Math.max(quantityInWarehouse - reserved, 0);
    });

    // 6. Calculate requirements and availability for each raw material
    const itemsResult: CheckAvailabilityItemResult[] = [];
    let totalMaterialCost = 0;
    let missingCount = 0;

    for (const item of bomItems) {
      // BOMs in older versions used materialId while newer/ERP BOMs may use
      // ingredientId / snake_case names. Resolve all supported shapes so the
      // sheet always shows the real raw-material master data instead of "1".
      const rawMaterialRef =
        (item as any).materialId ?? (item as any).ingredientId ?? (item as any).material_id ?? (item as any).ingredient_id ?? (item as any).id ?? '';
      const matIdStr = String(rawMaterialRef).trim();
      const itemNameRef = String((item as any).materialName ?? (item as any).ingredientName ?? (item as any).name ?? '').trim();
      const itemCodeRef = String((item as any).code ?? (item as any).ingredientCode ?? (item as any).item_code ?? '').trim();

      // Find matching ingredient by ID, code/item-code, or exact name.
      const normalizedName = itemNameRef.toLowerCase().replace(/\s+/g, ' ');
      const normalizedCode = itemCodeRef.toLowerCase();
      const ing = ingredientsList.find((g: any) => {
        const gName = String(g.name || '').trim().toLowerCase().replace(/\s+/g, ' ');
        const gCode = String(g.code || '').trim().toLowerCase();
        const gItemCode = String(g.item_code || '').trim().toLowerCase();
        return (matIdStr && String(g.id) === matIdStr) ||
          (normalizedCode && (gCode === normalizedCode || gItemCode === normalizedCode)) ||
          (normalizedName && gName === normalizedName);
      });

      const numericId = parseInt(matIdStr.replace(/[^0-9]/g, ''), 10) || 0;
      const ingredientId = ing ? Number(ing.id) : numericId;
      const ingredientName = ing?.name || itemNameRef || `خامة #${matIdStr}`;
      const ingredientCode = ing ? (ing.code || ing.item_code || `ITEM-${ingredientId}`) : (itemCodeRef || `RAW-${ingredientId}`);
      const unit = ing ? (ing.unit || (item as any).unit || 'وحدة') : ((item as any).unit || 'وحدة');
      const unitCost = ing ? (parseFloat(ing.avg_cost) || parseFloat(ing.cost) || parseFloat(ing.last_purchase_price) || 0) : 0;

      const qtyPerUnit = Number(item.quantity) || 0;
      const grossMultiplier = 1 + (scrapPercentage / 100);
      const totalRequiredQty = Math.ceil(qtyPerUnit * qty * grossMultiplier * 100) / 100;

      // IMPORTANT: production availability is warehouse-specific.
      // Never use ingredients.current_stock (global) as a substitute for the
      // selected issue warehouse; doing so can make the sheet disagree with
      // the actual posting transaction.
      let currentStock = stockMap[ingredientId];
      if (currentStock === undefined || currentStock === null || Number.isNaN(Number(currentStock))) {
        currentStock = 0;
      }

      const remainingStock = Math.round((currentStock - totalRequiredQty) * 100) / 100;
      const isAvailable = currentStock >= totalRequiredQty;
      const shortage = isAvailable ? 0 : Math.round((totalRequiredQty - currentStock) * 100) / 100;
      const itemCost = Math.round(totalRequiredQty * unitCost * 100) / 100;

      totalMaterialCost += itemCost;
      if (!isAvailable) missingCount++;

      itemsResult.push({
        ingredientId,
        ingredientCode,
        ingredientName,
        unit,
        quantityPerUnit: qtyPerUnit,
        totalRequiredQty,
        currentStock,
        remainingStock,
        unitCost,
        totalCost: itemCost,
        isAvailable,
        shortage,
        rawWarehouseId,
        rawWarehouseName
      });
    }

    totalMaterialCost = Math.round(totalMaterialCost * 100) / 100;
    const costPerUnit = qty > 0 ? Math.round((totalMaterialCost / qty) * 100) / 100 : 0;

    return {
      canProduce: missingCount === 0,
      productId,
      productName,
      quantity: qty,
      rawWarehouseId,
      rawWarehouseName,
      totalMaterialCost,
      costPerUnit,
      // Return the canonical fields plus legacy aliases consumed by older
      // production-sheet builds. Keeping both prevents a valid warehouse
      // balance from being rendered as 0 or the material id as its name.
      items: itemsResult.map((it: any) => ({
        ...it,
        materialId: it.ingredientId,
        materialName: it.ingredientName,
        code: it.ingredientCode,
        requiredPerUnit: it.quantityPerUnit,
        totalQuantityWithScrap: it.totalRequiredQty,
        currentStock: it.currentStock,
        unitCost: it.unitCost,
        totalItemCost: it.totalCost
      })),
      missingCount
    };
  }

  // ─────────────────────────────────────────────────────────────
  // EXECUTE PRODUCTION ORDER (SINGLE ATOMIC TRANSACTION)
  // ─────────────────────────────────────────────────────────────
  async executeProductionOrder(dto: ExecuteProductionOrderDTO): Promise<any> {
    await this.ensureTableExists();

    const client = await erpPool.connect();
    try {
      await client.query("BEGIN");

      // 1. Fetch Order Record
      let order: any = null;
      if (dto.orderId) {
        const ordRes = await client.query("SELECT * FROM production_orders WHERE id::text = $1::text OR order_number::text = $1::text LIMIT 1", [String(dto.orderId)]);
        if (ordRes.rows.length > 0) order = ordRes.rows[0];
      } else if (dto.orderNumber) {
        const ordRes = await client.query("SELECT * FROM production_orders WHERE order_number = $1 LIMIT 1", [dto.orderNumber]);
        if (ordRes.rows.length > 0) order = ordRes.rows[0];
      }

      // The production order MUST exist in the relational database before any
      // inventory movement is posted. Older builds could keep the order only
      // in localStorage/settings, which made execution non-deterministic.
      // If the client has supplied a complete order payload, persist it now;
      // otherwise fail before touching inventory.
      if (!order) {
        const orderNumber = String(dto.orderNumber || '').trim();
        const productId = String(dto.productId || '').trim();
        const quantity = Number(dto.quantity);
        if (!orderNumber || !productId || !Number.isFinite(quantity) || quantity <= 0) {
          throw new Error(`أمر الإنتاج غير محفوظ في قاعدة البيانات، ولا يمكن ترحيله بدون رقم أمر ومنتج وكمية صحيحة.`);
        }

        const upsertRes = await client.query(
          `INSERT INTO production_orders (
             order_number, product_id, product_name, quantity, bom_id,
             raw_warehouse_id, finished_warehouse_id, status, progress,
             notes, bom_snapshot
           )
           VALUES ($1,$2,$3,$4,$5,$6,$7,'planned',0,$8,$9)
           ON CONFLICT (order_number) DO UPDATE SET
             product_id = EXCLUDED.product_id,
             product_name = COALESCE(NULLIF(EXCLUDED.product_name,''), production_orders.product_name),
             quantity = EXCLUDED.quantity,
             raw_warehouse_id = COALESCE(EXCLUDED.raw_warehouse_id, production_orders.raw_warehouse_id),
             finished_warehouse_id = COALESCE(EXCLUDED.finished_warehouse_id, production_orders.finished_warehouse_id),
             notes = COALESCE(EXCLUDED.notes, production_orders.notes),
             bom_snapshot = CASE
               WHEN EXCLUDED.bom_snapshot IS NOT NULL AND EXCLUDED.bom_snapshot <> '{}' THEN EXCLUDED.bom_snapshot
               ELSE production_orders.bom_snapshot
             END,
             updated_at = NOW()
           RETURNING *`,
          [
            orderNumber,
            productId,
            String(dto.productName || ''),
            quantity,
            '',
            Number(dto.rawWarehouseId) || null,
            Number(dto.finishedWarehouseId) || null,
            dto.notes || '',
            '{}'
          ]
        );
        order = upsertRes.rows[0] || null;
      }

      if (!order) {
        throw new Error(`تعذر حفظ أمر الإنتاج [${dto.orderNumber || dto.orderId}] في قاعدة البيانات.`);
      }

      // Serialize execution attempts for the same production order, then lock the actual DB row.
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [String(order.order_number)]);
      const lockedOrderRes = await client.query(
        "SELECT * FROM production_orders WHERE order_number = $1 FOR UPDATE",
        [String(order.order_number)]
      );
      if (lockedOrderRes.rows.length > 0) order = lockedOrderRes.rows[0];

      // 2. IDEMPOTENCY CHECK - Prevent Double Execution
      if (order.status === 'completed' || order.is_executed || order.isExecuted) {
        throw new Error(`أمر الإنتاج رقم [${order.order_number}] مكتمل ومرحل بالفعل إلى المخازن مسبقاً، لا يمكن إعادة تنفيذه أو بدء تشغيله مرة أخرى منعاً لتكرار الصرف وازدواجية القيود.`);
      }

      // Also check production_runs table if a run for this orderNumber already exists
      const existingRun = await client.query(
        "SELECT id, created_at FROM production_runs WHERE order_number = $1 LIMIT 1",
        [order.order_number]
      );
      if (existingRun.rows.length > 0) {
        throw new Error(`أمر الإنتاج رقم [${order.order_number}] تم ترحيله مسبقاً (سند تشغيل رقم: ${existingRun.rows[0].id}). لا يمكن إعادة الترحيل.`);
      }

      const orderNumber = order.order_number;
      const orderNumericRef = parseInt(orderNumber.replace(/[^0-9]/g, '')) || Date.now();

      // The production order is permanently linked to its issue warehouse.
      // Never silently switch the source warehouse at execution time.
      const storedRawWarehouseId = Number(order.raw_warehouse_id || 0);
      const requestedRawWarehouseId = Number(dto.rawWarehouseId || 0);
      if (storedRawWarehouseId > 0 && requestedRawWarehouseId > 0 && storedRawWarehouseId !== requestedRawWarehouseId) {
        throw new Error(`مخزن صرف الخامات لأمر الإنتاج [${orderNumber}] هو المخزن رقم ${storedRawWarehouseId}، ولا يمكن تنفيذ الأمر من مخزن صرف مختلف.`);
      }
      const rawWarehouseId = storedRawWarehouseId || requestedRawWarehouseId;
      const finishedWarehouseId = Number(order.finished_warehouse_id || dto.finishedWarehouseId || rawWarehouseId);
      const producedQty = parseFloat(order.quantity) || 1;
      const user = dto.user || "مسؤول الإنتاج";

      if (!rawWarehouseId || !finishedWarehouseId) {
        throw new Error("يجب تحديد كل من مخزن صرف المواد الخام ومخزن استلام المنتج النهائي.");
      }

      const warehouseRes = await client.query(
        "SELECT id, name FROM warehouses WHERE id = ANY($1::int[])",
        [[rawWarehouseId, finishedWarehouseId]]
      );
      const warehouseIdsFound = new Set(warehouseRes.rows.map((r: any) => Number(r.id)));
      if (!warehouseIdsFound.has(rawWarehouseId)) {
        throw new Error(`مخزن صرف المواد الخام رقم ${rawWarehouseId} غير موجود.`);
      }
      if (!warehouseIdsFound.has(finishedWarehouseId)) {
        throw new Error(`مخزن استلام المنتج النهائي رقم ${finishedWarehouseId} غير موجود.`);
      }

      // 3. Resolve BOM and Snapshot Materials
      let snapshotItems: any[] = [];
      let scrapPercentage = 0;

      if (order.bom_snapshot) {
        try {
          const snap = typeof order.bom_snapshot === 'string' ? JSON.parse(order.bom_snapshot) : order.bom_snapshot;
          if (Array.isArray(snap.items) && snap.items.length > 0) {
            snapshotItems = snap.items;
            scrapPercentage = snap.scrapPercentage || 0;
          }
        } catch (e) {}
      }

      // Fallback: check availability engine to compute current BOM items
      if (snapshotItems.length === 0) {
        const avail = await this.checkAvailability(order.product_id, order.bom_id, producedQty, rawWarehouseId);
        snapshotItems = avail.items.map(it => ({
          materialId: it.ingredientId,
          ingredientId: it.ingredientId,
          materialName: it.ingredientName,
          quantityPerUnit: it.quantityPerUnit,
          totalRequiredQty: it.totalRequiredQty,
          unit: it.unit,
          unitCost: it.unitCost,
          totalCost: it.totalCost
        }));
      }

      // Pre-resolve all snapshot items to actual database ingredients in warehouse
      const allIngredientsRes = await client.query("SELECT id, name, code, item_code, unit, cost, avg_cost, last_purchase_price, current_stock FROM ingredients");
      const ingredientsList = allIngredientsRes.rows;

      const resolvedItems: any[] = [];
      for (const item of snapshotItems) {
        const matIdStr = String(item.materialId || item.ingredientId || '').trim();
        const matName = String(item.materialName || item.name || '').trim();
        const matCode = String(item.code || item.ingredientCode || item.item_code || '').trim();

        let ing = ingredientsList.find((g: any) => {
          const gIdStr = String(g.id || '').trim();
          const gCode = String(g.code || g.item_code || '').trim().toLowerCase();
          const gName = String(g.name || '').trim().toLowerCase();

          if (item.ingredientId && Number(g.id) === Number(item.ingredientId)) return true;
          if (matIdStr && gIdStr === matIdStr) return true;
          if (matCode && gCode && gCode === matCode.toLowerCase()) return true;
          if (matIdStr && gCode && gCode === matIdStr.toLowerCase()) return true;
          if (matName && gName && gName === matName.toLowerCase()) return true;
          if (matName && gName && (gName.includes(matName.toLowerCase()) || matName.toLowerCase().includes(gName))) return true;
          return false;
        });

        // A production execution must never invent a new raw material. A missing
        // master-data link is a configuration error and must be reported before
        // inventory is touched.
        const ingId = ing ? Number(ing.id) : (parseInt(matIdStr.replace(/[^0-9]/g, '')) || 0);
        const name = item.materialName || item.name || (ing ? ing.name : `خامة #${matIdStr}`);
        const unit = item.unit || (ing ? ing.unit : 'وحدة') || 'وحدة';
        const unitCost = Number(item.unitCost) || (ing ? (parseFloat(ing.avg_cost) || parseFloat(ing.cost) || parseFloat(ing.last_purchase_price) || 0) : 0);
        const perUnitQty = Number(item.quantityPerUnit ?? item.requiredPerUnit ?? item.quantity ?? 0);
        const snapshotTotal = Number(item.totalRequiredQty ?? item.totalQuantityWithScrap ?? 0);
        const reqQty = snapshotTotal > 0
          ? snapshotTotal
          : Math.round(perUnitQty * producedQty * (1 + (Number(scrapPercentage) || 0) / 100) * 100) / 100;

        if (!ing || ingId <= 0 || !Number.isFinite(reqQty) || reqQty <= 0) {
          throw new Error(
            `تعذر ربط خامة أمر الإنتاج [${orderNumber}] بالمادة الخام في دليل الأصناف. ` +
            `راجع وصفة التصنيع وتأكد أن كل خامة مرتبطة بصنف خام صحيح.`
          );
        }

        resolvedItems.push({
          ...item,
          ingredientId: ingId,
          materialId: ingId,
          materialName: name,
          unit,
          unitCost,
          reqQty
        });
      }

      // 4. Validate stock availability if allowNegativeStock is false
      if (!dto.allowNegativeStock) {
        const missingItems: string[] = [];
        for (const item of resolvedItems) {
          const ingId = item.ingredientId;
          const reqQty = item.reqQty;

          let currentStock = 0;
          if (ingId > 0) {
            const stockCheck = await client.query(
              "SELECT available, quantity, reserved FROM inventory_items WHERE warehouse_id = $1 AND ingredient_id = $2 FOR UPDATE",
              [rawWarehouseId, ingId]
            );

            if (stockCheck.rows.length > 0) {
              const row = stockCheck.rows[0];
              // available is authoritative for the selected warehouse. If an
              // old row has a stale available value, derive it from quantity
              // minus reservations while the row is locked.
              const qtyVal = Number(row.quantity || 0);
              const reservedVal = Number(row.reserved || 0);
              // `quantity - reserved` is the authoritative balance. Older rows
              // may contain a stale/zero `available` value, which previously
              // caused valid raw materials to be reported as unavailable.
              currentStock = Math.max(qtyVal - reservedVal, 0);
            }
            // Deliberately NO global ingredients.current_stock fallback and NO
            // other-warehouse fallback. Production must consume only from the
            // warehouse saved on this production order.
          }

          if (currentStock < reqQty) {
            missingItems.push(`[${item.materialName}]: المتوفر بالمخزن ${currentStock} والمطلوب ${reqQty} ${item.unit}`);
          }
        }

        if (missingItems.length > 0) {
          throw new Error(`رصيد المواد الخام غير كافٍ في المخزن المحدد:\n` + missingItems.join("\n"));
        }
      }

      // 5. STEP A: Deduct consumed raw materials from warehouse (Movement ref_type: "production_consumption")
      const deductedItems: any[] = [];
      let calculatedTotalCost = 0;

      for (const item of resolvedItems) {
        const ingId = item.ingredientId;
        const reqQty = item.reqQty;
        const unitCost = item.unitCost;
        const itemTotalCost = Math.round(reqQty * unitCost * 100) / 100;
        calculatedTotalCost += itemTotalCost;

        if (ingId > 0) {
          await applyStockMovement(client, {
            warehouse_id: rawWarehouseId,
            ingredient_id: ingId,
            delta: -reqQty,
            field: "quantity",
            ref_type: "production_consumption",
            ref_id: orderNumericRef,
            user: user,
            notes: `صرف واستهلاك مواد خام من المخزن لأمر إنتاج رقم ${orderNumber} - خامة: ${item.materialName}`,
            unit_cost: unitCost,
            ingredient_name: item.materialName
          });

          const sumRes = await client.query(
            "SELECT COALESCE(SUM(quantity), 0) as total FROM inventory_items WHERE ingredient_id = $1",
            [ingId]
          );
          const totalStock = Number(sumRes.rows[0]?.total || 0);
          await client.query(
            "UPDATE ingredients SET current_stock = $1 WHERE id = $2",
            [totalStock, ingId]
          );
        }

        deductedItems.push({
          ingredientId: ingId,
          name: item.materialName,
          quantity: reqQty,
          unit: item.unit,
          unitCost: unitCost,
          totalCost: itemTotalCost
        });
      }

      // 6. STEP B: Add finished goods produced to Finished Warehouse (Movement ref_type: "production_receipt")
      // Resolve or insert matching ingredient for finished product
      let finishedProductName = dto.productName || order.product_name;
      let finishedUnit = 'وحدة';
      let finishedCost = producedQty > 0 ? (calculatedTotalCost / producedQty) : 0;
      let finishedProductCode = String(dto.productId || order.product_id || '');

      const prodRes = await client.query(
        "SELECT id, name, code, barcode, unit, cost, price, category_id FROM products WHERE id::text = $1::text OR code::text = $1::text OR barcode::text = $1::text OR name::text = $1::text",
        [String(dto.productId || order.product_id)]
      );
      if (prodRes.rows.length > 0) {
        const p = prodRes.rows[0];
        if (!finishedProductName || finishedProductName.startsWith('منتج #')) {
          finishedProductName = p.name;
        }
        finishedUnit = p.unit || finishedUnit;
        finishedProductCode = p.code || p.barcode || finishedProductCode;
        if (finishedCost <= 0) finishedCost = Number(p.cost) || Number(p.price) || 0;
      }

      // Check settings/remo_production_products if name is still placeholder
      if (!finishedProductName || finishedProductName.startsWith('منتج #')) {
        try {
          const settingsRes = await client.query("SELECT value FROM settings WHERE key = 'remo_production_products'");
          if (settingsRes.rows.length > 0) {
            const list = JSON.parse(settingsRes.rows[0].value || '[]');
            const found = list.find((p: any) => p.id === order.product_id || p.code === order.product_id || p.name === order.product_id);
            if (found) {
              finishedProductName = found.name;
              finishedUnit = found.unit || finishedUnit;
              finishedProductCode = found.code || finishedProductCode;
            }
          }
        } catch (e) {}
      }

      if (!finishedProductName || finishedProductName.startsWith('منتج #')) {
        finishedProductName = finishedProductCode ? `منتج تام (${finishedProductCode})` : `منتج أمر الإنتاج ${orderNumber}`;
      }

      // Thorough lookup to prevent duplicates (by name, normalized name, code, barcode, or product id)
      const allIngsRes = await client.query("SELECT id, name, code, item_code, barcode, current_stock FROM ingredients");
      const normFinishedName = (finishedProductName || '').trim().toLowerCase().replace(/\s+/g, ' ');
      
      let matchedIng = allIngsRes.rows.find((ing: any) => {
        const ingName = (ing.name || '').trim().toLowerCase().replace(/\s+/g, ' ');
        if (ingName && normFinishedName && (ingName === normFinishedName || ingName.includes(normFinishedName) || normFinishedName.includes(ingName))) return true;
        if (finishedProductCode && (ing.code === finishedProductCode || ing.item_code === finishedProductCode || ing.barcode === finishedProductCode)) return true;
        return false;
      });

      let finishedIngredientId = matchedIng?.id;

      if (!finishedIngredientId) {
        // Auto-create ingredient record with standard warehouse ITEM-XXXX code
        const maxIdRes = await client.query("SELECT MAX(id) as max_id FROM ingredients");
        const nextId = (maxIdRes.rows[0]?.max_id || 0) + 1;
        const codeToUse = `ITEM-${1000 + nextId}`;
        const newIng = await client.query(
          `INSERT INTO ingredients (
            name, code, item_code, barcode, unit, cost, avg_cost, last_purchase_price,
            item_group, category, allow_sales, allow_purchase, current_stock, is_manufactured
          )
          VALUES ($1::text, $2::text, $3::text, $4::text, $5::text, $6::numeric, $6::numeric, $6::numeric, 'منتجات تامة الصنع', 'منتجات تامة الصنع', 1, 0, 0, 1)
          RETURNING id`,
          [finishedProductName, codeToUse, codeToUse, finishedProductCode || null, finishedUnit, finishedCost]
        );
        finishedIngredientId = newIng.rows[0]?.id;
      } else {
        // Cost is decimal by contract. Use a schema-aware fallback for databases
        // that were created with legacy INTEGER columns and could not be migrated
        // yet; this keeps posting functional while the startup repair fixes the schema.
        const costTypeRes = await client.query(
          `SELECT data_type FROM information_schema.columns
           WHERE table_schema = current_schema() AND table_name = 'ingredients' AND column_name = 'cost'`
        );
        const avgCostTypeRes = await client.query(
          `SELECT data_type FROM information_schema.columns
           WHERE table_schema = current_schema() AND table_name = 'ingredients' AND column_name = 'avg_cost'`
        );
        const costIsInteger = ['integer', 'bigint', 'smallint'].includes(String(costTypeRes.rows[0]?.data_type || '').toLowerCase());
        const avgCostIsInteger = ['integer', 'bigint', 'smallint'].includes(String(avgCostTypeRes.rows[0]?.data_type || '').toLowerCase());

        if (costIsInteger || avgCostIsInteger) {
          await client.query(
            `UPDATE ingredients
             SET cost = CASE WHEN $1::numeric > 0 THEN ROUND($1::numeric) ELSE cost END,
                 avg_cost = CASE WHEN $1::numeric > 0 THEN ROUND($1::numeric) ELSE avg_cost END,
                 is_manufactured = 1
             WHERE id = $2::integer`,
            [finishedCost, finishedIngredientId]
          );
        } else {
          await client.query(
            `UPDATE ingredients
             SET cost = CASE WHEN $1::numeric > 0 THEN $1::numeric ELSE cost END,
                 avg_cost = CASE WHEN $1::numeric > 0 THEN $1::numeric ELSE avg_cost END,
                 is_manufactured = 1
             WHERE id = $2::integer`,
            [finishedCost, finishedIngredientId]
          );
        }
      }

      // Apply movement to inventory_items
      await applyStockMovement(client, {
        warehouse_id: finishedWarehouseId,
        ingredient_id: finishedIngredientId,
        delta: producedQty,
        field: "quantity",
        ref_type: "production_receipt",
        ref_id: orderNumericRef,
        user: user,
        notes: `استلام منتج تام الصنع من أمر إنتاج رقم ${orderNumber} - كمية: ${producedQty} ${finishedUnit}`,
        unit_cost: finishedCost,
        ingredient_name: finishedProductName
      });

      // Update total current_stock in ingredients table
      const finSumRes = await client.query(
        "SELECT COALESCE(SUM(quantity), 0) as total FROM inventory_items WHERE ingredient_id = $1",
        [finishedIngredientId]
      );
      const finTotalStock = Number(finSumRes.rows[0]?.total || 0);
      await client.query(
        "UPDATE ingredients SET current_stock = $1 WHERE id = $2",
        [finTotalStock, finishedIngredientId]
      );

      for (const item of resolvedItems) {
        if (item.ingredientId > 0) {
          const itemSumRes = await client.query(
            "SELECT COALESCE(SUM(quantity), 0) as total FROM inventory_items WHERE ingredient_id = $1",
            [item.ingredientId]
          );
          const itemTotal = Number(itemSumRes.rows[0]?.total || 0);
          await client.query(
            "UPDATE ingredients SET current_stock = $1 WHERE id = $2",
            [itemTotal, item.ingredientId]
          );
        }
      }

      // Official Inventory Transactions Logging (non-blocking audit mirror).
      // Savepoints prevent a legacy audit-table schema from aborting production.
      await client.query("SAVEPOINT production_inventory_logs");
      try {
        const rcTxNumber = `TXN-PRD-REC-${orderNumericRef}`;
        await client.query(
          `INSERT INTO inventory_transactions (
            transaction_number, date, warehouse_id, type, reason, reference, "user", status, notes, items
          )
          VALUES ($1, CURRENT_DATE, $2, 'receive', 'استلام إنتاج تام', $3, $4, 'approved', $5, $6)
          ON CONFLICT DO NOTHING`,
          [
            rcTxNumber,
            finishedWarehouseId,
            orderNumber,
            user,
            `استلام وتوريد منتج تام الصنع [${finishedProductName}] من أمر إنتاج رقم ${orderNumber}`,
            JSON.stringify([{
              ingredient_id: finishedIngredientId,
              name: finishedProductName,
              unit: finishedUnit,
              quantity: producedQty,
              price: finishedCost,
              total: Math.round(producedQty * finishedCost * 100) / 100
            }])
          ]
        );
      } catch (txErr) {
        try { await client.query("ROLLBACK TO SAVEPOINT production_inventory_logs"); } catch (_) {}
        console.warn("Receipt transaction logging warning:", txErr);
      }

      try {
        if (deductedItems.length > 0) {
          const isTxNumber = `TXN-PRD-ISS-${orderNumericRef}`;
          await client.query(
            `INSERT INTO inventory_transactions (
              transaction_number, date, warehouse_id, type, reason, reference, "user", status, notes, items
            )
            VALUES ($1, CURRENT_DATE, $2, 'issue', 'صرف خامات لأمر إنتاج', $3, $4, 'approved', $5, $6)
            ON CONFLICT DO NOTHING`,
            [
              isTxNumber,
              rawWarehouseId,
              orderNumber,
              user,
              `صرف واستهلاك خامات ومكونات لتشغيل أمر الإنتاج رقم ${orderNumber}`,
              JSON.stringify(deductedItems.map(d => ({
                ingredient_id: d.ingredientId,
                name: d.name,
                unit: d.unit,
                quantity: d.quantity,
                price: d.unitCost,
                total: d.totalCost
              })))
            ]
          );
        }
      } catch (txErr) {
        try { await client.query("ROLLBACK TO SAVEPOINT production_inventory_logs"); } catch (_) {}
        console.warn("Issue transaction logging warning:", txErr);
      }
      try {
        await client.query("RELEASE SAVEPOINT production_inventory_logs");
      } catch (_) {}

      // Sync Products Table (for POS and Sales catalog). This is secondary to
      // the warehouse receipt, so isolate it with a savepoint: an old products
      // schema can never abort the main production transaction.
      await client.query("SAVEPOINT production_products_sync");
      try {
        // Ensure the canonical active flag exists on legacy databases.
        await client.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true");
        const prodCheck = await client.query(
          "SELECT id FROM products WHERE id::text = $1::text OR code::text = $1::text OR name::text = $2::text",
          [String(order.product_id), finishedProductName]
        );
        if (prodCheck.rows.length === 0) {
          await client.query(
            `INSERT INTO products (name, code, barcode, unit, cost, price, is_active)
             VALUES ($1, $2, $2, $3, $4, $5, true)
             ON CONFLICT DO NOTHING`,
            [
              finishedProductName,
              finishedProductCode || `PROD-${order.product_id}`,
              finishedUnit,
              finishedCost,
              Math.round(finishedCost * 1.25 * 100) / 100
            ]
          );
        }
        await client.query("RELEASE SAVEPOINT production_products_sync");
      } catch (prodErr) {
        await client.query("ROLLBACK TO SAVEPOINT production_products_sync");
        await client.query("RELEASE SAVEPOINT production_products_sync");
        console.warn("Products sync warning (non-blocking):", prodErr);
      }

      // 7. Insert official record into production_runs
      const runRes = await client.query(
        `INSERT INTO production_runs (
          order_number, product_id, warehouse_id, finished_warehouse_id,
          quantity, status, total_cost, unit_cost, bom_id, bom_snapshot,
          notes, executed_by, executed_at
        )
        VALUES ($1, $2, $3, $4, $5, 'completed', $6, $7, $8, $9, $10, $11, NOW())
        RETURNING *`,
        [
          orderNumber,
          prodRes.rows[0]?.id || parseInt(String(order.product_id).replace(/[^0-9]/g, '')) || 1,
          rawWarehouseId,
          finishedWarehouseId,
          producedQty,
          calculatedTotalCost,
          finishedCost,
          order.bom_id || '',
          JSON.stringify(snapshotItems),
          dto.notes || `تنفيذ وترحيل أمر الإنتاج رقم ${orderNumber} بنجاح`,
          user
        ]
      );
      const newRun = runRes.rows[0];

      // 8. Update Order status in database
      await client.query(
        `UPDATE production_orders 
         SET status = 'completed', progress = 100, is_executed = true, executed_by = $1, executed_at = NOW(),
             raw_warehouse_id = $2, finished_warehouse_id = $3, total_cost = $4, cost_per_unit = $5
         WHERE order_number = $6`,
        [user, rawWarehouseId, finishedWarehouseId, calculatedTotalCost, finishedCost, orderNumber]
      );

      // 9. Sync with remo_production_orders in settings table for frontend/other components
      try {
        const curSettings = await client.query("SELECT value FROM settings WHERE key = 'remo_production_orders'");
        if (curSettings.rows.length > 0) {
          const list = JSON.parse(curSettings.rows[0].value || '[]');
          const updatedList = list.map((o: any) => {
            if (o.orderNumber === orderNumber || o.id === order.id) {
              return {
                ...o,
                status: 'completed',
                progress: 100,
                is_executed: true,
                isExecuted: true,
                executedBy: user,
                executedAt: new Date().toISOString(),
                rawWarehouseId,
                finishedWarehouseId,
                totalCost: calculatedTotalCost,
                costPerUnit: finishedCost
              };
            }
            return o;
          });
          await client.query("UPDATE settings SET value = $1 WHERE key = 'remo_production_orders'", [JSON.stringify(updatedList)]);
        }
      } catch (syncErr) {
        console.warn("Could not sync remo_production_orders settings:", syncErr);
      }

      await client.query("COMMIT");

      return {
        success: true,
        orderNumber,
        status: 'completed',
        producedQuantity: producedQty,
        productName: finishedProductName,
        rawWarehouseId,
        finishedWarehouseId,
        deductedMaterialsCount: deductedItems.length,
        deductedItems,
        totalMaterialCost: calculatedTotalCost,
        costPerUnit: finishedCost,
        runId: newRun?.id,
        executedAt: new Date().toISOString(),
        executedBy: user,
        message: `تم تنفيذ وترحيل أمر الإنتاج [${orderNumber}] بنجاح، وخصم المواد الخام، وإضافة المنتج التام للمخازن.`
      };

    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteOrder(id: string): Promise<boolean> {
    await this.ensureTableExists();
    try {
      await erpPool.query("DELETE FROM production_orders WHERE id::text = $1::text OR order_number::text = $1::text", [id]);
      return true;
    } catch (e) {
      console.error("Error deleting production order:", e);
      return false;
    }
  }

  async clearOrders(): Promise<boolean> {
    await this.ensureTableExists();
    try {
      await erpPool.query("DELETE FROM production_orders");
      await erpPool.query("DELETE FROM production_runs");
      return true;
    } catch (e) {
      console.error("Error clearing production orders:", e);
      return false;
    }
  }

  async deleteBOM(id: string): Promise<boolean> {
    await this.ensureTableExists();
    try {
      await erpPool.query("DELETE FROM production_boms WHERE id = $1", [id]);
      return true;
    } catch (e) {
      console.error("Error deleting BOM:", e);
      return false;
    }
  }

  async clearBOMs(): Promise<boolean> {
    await this.ensureTableExists();
    try {
      await erpPool.query("DELETE FROM production_boms");
      return true;
    } catch (e) {
      console.error("Error clearing BOMs:", e);
      return false;
    }
  }

  // Legacy fallback for simple production run record
  async create(run: CreateProductionRunDTO): Promise<any> {
    return this.executeProductionOrder({
      orderNumber: `RUN-${Date.now()}`,
      rawWarehouseId: run.warehouse_id,
      finishedWarehouseId: run.finished_warehouse_id || run.warehouse_id,
      allowNegativeStock: true,
      notes: run.notes
    });
  }
}
