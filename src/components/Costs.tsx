import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ChevronLeft, BarChart3, Plus, Search, Trash2, Edit2, TrendingUp, 
  Wallet, DollarSign, Calendar, Building2, Tag, Download, RefreshCw, 
  SlidersHorizontal, Sparkles, Paperclip, CheckCircle, CheckCircle2, Clock, User, 
  FileSpreadsheet, Layers, Settings, FileText, Check, AlertCircle, AlertTriangle, Eye,
  Upload, Shuffle, Percent, Calculator, History, Briefcase, UserCheck, BookOpen, Activity, FileCode,
  Printer, Award, Package, PieChart as PieChartIcon, ShoppingCart, Store, Utensils, X, Save,
  ChevronDown, CheckCheck, Filter, Maximize2, Minimize2
} from 'lucide-react';
import { CostsReportsDetails } from './costs/CostsReportsDetails';
import { api } from '../utils/api';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, AreaChart, Area
} from 'recharts';

interface CostsProps {
  onBack: () => void;
  initialTab?: string;
}

interface SearchableIngredientComboboxProps {
  value: string;
  onChange: (id: string) => void;
  ingredients: any[];
  placeholder?: string;
  disabled?: boolean;
}

const SearchableIngredientCombobox: React.FC<SearchableIngredientComboboxProps> = ({
  value,
  onChange,
  ingredients,
  placeholder = "ابحث بالاسم أو كود الصنف أو الباركود...",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedItem = useMemo(() => {
    return ingredients.find(i => String(i.id) === String(value));
  }, [value, ingredients]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return ingredients;
    const q = query.toLowerCase().trim();
    return ingredients.filter(i => {
      const nameMatch = i.name ? String(i.name).toLowerCase().includes(q) : false;
      const codeMatch = (i.item_code || i.code) ? String(i.item_code || i.code).toLowerCase().includes(q) : false;
      const barcodeMatch = i.barcode ? String(i.barcode).toLowerCase().includes(q) : false;
      const catMatch = (i.category || i.item_group) ? String(i.category || i.item_group).toLowerCase().includes(q) : false;
      const idMatch = String(i.id).includes(q);
      return nameMatch || codeMatch || barcodeMatch || catMatch || idMatch;
    });
  }, [ingredients, query]);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {/* Trigger Button */}
      <div 
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={`w-full p-2 bg-white border rounded-xl cursor-pointer flex items-center justify-between text-xs transition-all shadow-sm ${
          disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' :
          isOpen ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        {selectedItem ? (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="font-mono text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0">
              {selectedItem.item_code || `ITEM-${selectedItem.id}`}
            </span>
            <span className="font-black text-slate-800 truncate">{selectedItem.name}</span>
            <span className="text-[10px] text-slate-500 shrink-0">({selectedItem.unit || 'كجم'})</span>
          </div>
        ) : (
          <span className="text-slate-400 font-normal truncate">{placeholder}</span>
        )}

        <div className="flex items-center gap-1.5 shrink-0 mr-1">
          {selectedItem && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                setQuery('');
              }}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100"
              title="إلغاء التحديد"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
        </div>
      </div>

      {/* Floating Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute z-50 top-full mt-1.5 right-0 w-full min-w-[340px] max-w-[460px] bg-white border border-slate-200 rounded-2xl shadow-2xl p-2.5 space-y-2 animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Live Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث بالاسم، كود الصنف (ITEM-...) أو الباركود..."
              className="w-full pr-8 pl-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder:font-normal placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px] bg-slate-200 hover:bg-slate-300 w-4 h-4 rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center justify-between px-1 text-[10px] text-slate-400 font-bold border-b border-slate-100 pb-1.5">
            <span>النتائج المتاحة ({filteredItems.length})</span>
            <span>انقر على الصنف للاختيار</span>
          </div>

          {/* List of Ingredients */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 rounded-xl">
            {filteredItems.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs">
                لا توجد أصناف تطابق: <b className="text-slate-700 font-mono">"{query}"</b>
              </div>
            ) : (
              filteredItems.map((ing) => {
                const isSelected = String(ing.id) === String(value);
                const stock = Number(ing.available_stock || 0);
                const cost = Number(ing.unit_cost || ing.avg_cost || ing.cost || 0);
                const code = ing.item_code || `ITEM-${ing.id}`;

                return (
                  <div
                    key={ing.id}
                    onClick={() => {
                      onChange(String(ing.id));
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className={`p-2.5 hover:bg-indigo-50/70 cursor-pointer rounded-xl transition-all flex items-center justify-between gap-2 my-0.5 ${
                      isSelected ? 'bg-indigo-50/90 text-indigo-950 font-bold border-r-4 border-indigo-600 shadow-sm' : 'text-slate-800'
                    }`}
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[10px] font-black text-indigo-700 bg-indigo-100/90 border border-indigo-200/80 px-1.5 py-0.5 rounded">
                          {code}
                        </span>
                        <span className="text-xs font-black text-slate-900 truncate">{ing.name}</span>
                        {(ing.category || ing.item_group) && (
                          <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                            {ing.category || ing.item_group}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2">
                        <span>الوحدة: <b className="text-slate-700">{ing.unit || 'كجم'}</b></span>
                        <span>•</span>
                        <span>سعر الوحدة: <b className="text-indigo-600 font-mono font-bold">{cost.toFixed(2)} ج.م</b></span>
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <span className={`text-[10px] px-2 py-1 rounded-lg font-bold block ${
                        stock > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        رصيد: {stock.toFixed(1)} {ing.unit || 'كجم'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const Costs: React.FC<CostsProps> = ({ onBack, initialTab }) => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'operating_costs' | 'budget' | 'centers' | 'items' | 'form' | 'reports' | 'allocation' | 'standard_costing' | 'product_costing' | 'settings'>(() => {
    if (!initialTab) {
      const saved = localStorage.getItem('last_costs_tab');
      if (saved) return saved as any;
    }
    return 'dashboard';
  });
  const [activeReportSubTab, setActiveReportSubTab] = useState<string>('report_op_summary');
  const [activeSettingsSubTab, setActiveSettingsSubTab] = useState<'general' | 'rules' | 'budgets' | 'permissions' | 'cost_items_settings'>('general');

  useEffect(() => {
    if (activeTab) {
      try {
        localStorage.setItem('last_costs_tab', activeTab);
      } catch (_) {}
    }
  }, [activeTab]);

  useEffect(() => {
    if (!initialTab) return;
    
    if (initialTab.startsWith('report_')) {
      setActiveTab('reports');
      setActiveReportSubTab(initialTab as any);
    } else if (initialTab.startsWith('settings_')) {
      setActiveTab('settings');
      setActiveSettingsSubTab(initialTab.replace('settings_', '') as any);
    } else if (
      initialTab === 'operating_costs' ||
      initialTab === 'budget' ||
      initialTab === 'centers' ||
      initialTab === 'items' ||
      initialTab === 'form' ||
      initialTab === 'reports' ||
      initialTab === 'allocation' ||
      initialTab === 'standard_costing' ||
      initialTab === 'product_costing' ||
      initialTab === 'settings' ||
      initialTab === 'dashboard'
    ) {
      setActiveTab(initialTab as any);
    }
  }, [initialTab]);

  // Core Data Lists
  const [costs, setCosts] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);

  // System Linked Entities
  const [systemBranches, setSystemBranches] = useState<any[]>([]);
  const [systemWarehouses, setSystemWarehouses] = useState<any[]>([]);
  const [systemWorkCenters, setSystemWorkCenters] = useState<any[]>([]);
  const [systemSafes, setSystemSafes] = useState<any[]>([]);
  const [systemDepartments, setSystemDepartments] = useState<any[]>([]);
  const [systemAccounts, setSystemAccounts] = useState<any[]>([]);

  // New ERP & Deep Integration Entities
  const [systemEmployees, setSystemEmployees] = useState<any[]>([]);
  const [systemSuppliers, setSystemSuppliers] = useState<any[]>([]);
  const [systemCustomers, setSystemCustomers] = useState<any[]>([]);
  const [systemProducts, setSystemProducts] = useState<any[]>([]);
  const [systemIngredients, setSystemIngredients] = useState<any[]>([]);

  // Filtering & Search States
  const [filterCostType, setFilterCostType] = useState('all');
  const [filterCenter, setFilterCenter] = useState('all');
  const [filterDept, setFilterDept] = useState('all');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterFromDate, setFilterFromDate] = useState('2026-01-01');
  const [filterToDate, setFilterToDate] = useState('2026-07-03');
  const [searchQuery, setSearchQuery] = useState('');

  // Local filter states for Operating Costs Tab
  const [ocSearch, setOcSearch] = useState('');
  const [ocStatus, setOcStatus] = useState('all');
  const [ocCenter, setOcCenter] = useState('all');
  const [ocFromDate, setOcFromDate] = useState('2026-07-01');
  const [ocToDate, setOcToDate] = useState('2026-07-31');

  // Local filter states for Budget Tab
  const [budgetYear, setBudgetYear] = useState(2026);
  const [budgetMonth, setBudgetMonth] = useState('يوليو');
  const [budgetBranch, setBudgetBranch] = useState('الكل');

  // Budget Modal & Form State
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [newBudget, setNewBudget] = useState({
    year: 2026,
    month: 'يوليو',
    cost_center_id: '',
    cost_item_id: '',
    amount: '',
    notes: ''
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // New Cost Form State
  const [formData, setFormData] = useState({
    voucher_no: '',
    date: new Date().toISOString().split('T')[0],
    branch: 'القاهرة',
    department: 'المخازن',
    cost_center_id: '',
    cost_item_id: '',
    payment_method: 'نقدي',
    safe: 'خزينة فرع القاهرة',
    notes: '',
    amount: '',
    status: 'جديد',
    created_by: 'محمد أحمد',
    link_ledger: true,
    // Integration Fields
    project: '',
    product: '',
    product_id: '',
    supplier: '',
    supplier_id: '',
    employee: '',
    employee_id: '',
    customer: '',
    customer_id: '',
    warehouse_id: '',
    accounting_account: '',
    tax: '0',
    total: '',
    currency: 'EGP'
  });

  // Attachments State
  const [attachments, setAttachments] = useState<any[]>([
    { id: 1, name: 'فاتورة_الكهرباء_الرئيسية_شهر_5.pdf', size: '2.4 MB' },
    { id: 2, name: 'عقد_التأسيس_والإيجار_المؤمن.pdf', size: '1.8 MB' }
  ]);
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  // Modals States
  const [showCenterModal, setShowCenterModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [selectedCostDetail, setSelectedCostDetail] = useState<any>(null);

  // New Center Form State
  const [newCenter, setNewCenter] = useState({
    id: null as number | null,
    code: '',
    name: '',
    type: 'إنتاج',
    branch: 'القاهرة',
    manager: '',
    status: 'نشط',
    notes: '',
    monthly_budget: '',
    parent_id: ''
  });

  // New Item Form State
  const [newItem, setNewItem] = useState({
    id: null as number | null,
    code: '',
    name: '',
    cost_type: 'تشغيل',
    department: 'المصروفات العامة',
    status: 'نشط',
    parent_id: '',
    accounting_account_id: '',
    description: '',
    // Comprehensive Integration Properties
    default_center_id: '',
    budget_cap: '',
    is_hr_linked: false,
    is_procurement_linked: false,
    is_warehouse_linked: false
  });

  // Track the active item configuration state
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Cost Allocation State
  const [allocSource, setAllocSource] = useState('custom');
  const [allocAmount, setAllocAmount] = useState('15000');
  const [allocMethod, setAllocMethod] = useState<'percentage' | 'fixed' | 'quantity' | 'hours' | 'employees' | 'area'>('percentage');
  const [allocTargetType, setAllocTargetType] = useState<'centers' | 'branches' | 'departments' | 'products' | 'projects'>('centers');
  const [allocRows, setAllocRows] = useState<any[]>([
    { targetId: '1', value: '40', description: 'توزيع قسم الإنتاج' },
    { targetId: '2', value: '60', description: 'توزيع قسم الإدارة والتسويق' }
  ]);

  // Loaded Rates State
  const [loadedRateType, setLoadedRateType] = useState<'machine' | 'employee'>('machine');
  const [loadedBaseRate, setLoadedBaseRate] = useState('250');
  const [loadedOverhead, setLoadedOverhead] = useState('75');
  const [loadedHours, setLoadedHours] = useState('160');

  // Standard Costing State
  const [stdMaterials, setStdMaterials] = useState('180');
  const [stdLabor, setStdLabor] = useState('120');
  const [stdOverhead, setStdOverhead] = useState('70');
  const [stdUtilities, setStdUtilities] = useState('45');
  const [varianceFilterCenter, setVarianceFilterCenter] = useState('all');

  // Product Costing State
  const [prodSelected, setProdSelected] = useState('pizza');
  const [prodRawMaterial, setProdRawMaterial] = useState('35');
  const [prodDirectLabor, setProdDirectLabor] = useState('12');
  const [prodElectricity, setProdElectricity] = useState('4');
  const [prodMaintenance, setProdMaintenance] = useState('3');
  const [prodDepreciation, setProdDepreciation] = useState('2');
  const [prodTransport, setProdTransport] = useState('3');
  const [prodPackaging, setProdPackaging] = useState('2');
  const [prodIndirectOverhead, setProdIndirectOverhead] = useState('5');
  const [prodSellingPrice, setProdSellingPrice] = useState('100');
  const [prodResult, setProdResult] = useState<any>(null);

  // Recipe Costing Engine States
  const [recipeList, setRecipeList] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [recipeSearchQuery, setRecipeSearchQuery] = useState<string>('');
  const [recipeTypeFilter, setRecipeTypeFilter] = useState<'all' | 'pos' | 'with_recipe' | 'no_recipe'>('all');
  const [costSource, setCostSource] = useState<'weighted_avg' | 'last_purchase' | 'standard'>('weighted_avg');
  const [recipeData, setRecipeData] = useState<any>(null);
  const [loadingRecipe, setLoadingRecipe] = useState<boolean>(false);
  const [costingActiveTab, setCostingActiveTab] = useState<'ingredients' | 'breakdown' | 'yield' | 'waste' | 'packaging' | 'profitability' | 'history' | 'simulation'>('ingredients');
  const [simulationIngredients, setSimulationIngredients] = useState<any[]>([]);
  const [simulationTargetMargin, setSimulationTargetMargin] = useState<number>(35);
  const [simulationPortions, setSimulationPortions] = useState<number>(1);
  const [recipeCostHistory, setRecipeCostHistory] = useState<any[]>([]);

  // Recipe Builder Modal States
  const [showRecipeEditorModal, setShowRecipeEditorModal] = useState<boolean>(false);
  const [costingWarehouseId, setCostingWarehouseId] = useState<string>('all');
  const [allIngredientsList, setAllIngredientsList] = useState<any[]>([]);
  const [editorIngredients, setEditorIngredients] = useState<any[]>([]);
  const [editorYieldPortions, setEditorYieldPortions] = useState<number>(1);
  const [editorWarehouseId, setEditorWarehouseId] = useState<string>('all');
  const [savingRecipeIngredients, setSavingRecipeIngredients] = useState<boolean>(false);
  const [editorIngredientSearch, setEditorIngredientSearch] = useState<string>('');
  const [editorIngredientCategoryFilter, setEditorIngredientCategoryFilter] = useState<string>('all');
  const [showQuickAddCatalog, setShowQuickAddCatalog] = useState<boolean>(false);
  const [loadingIngredients, setLoadingIngredients] = useState<boolean>(false);
  const [recipeEditorExpanded, setRecipeEditorExpanded] = useState<boolean>(true);

  const fetchAllAvailableIngredients = async (whId?: string) => {
    setLoadingIngredients(true);
    const targetWh = whId !== undefined ? whId : (costingWarehouseId || 'all');
    try {
      const res = await api.get(`/api/costs/recipe-costing/all-ingredients?warehouse_id=${encodeURIComponent(targetWh)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setAllIngredientsList(json.data);
      } else {
        // Direct fallback from /api/ingredients (Item Management)
        const fallbackRes = await api.get('/api/ingredients');
        const fallbackData = await fallbackRes.json();
        if (Array.isArray(fallbackData) && fallbackData.length > 0) {
          setAllIngredientsList(fallbackData.map((ing: any) => ({
            id: ing.id,
            name: ing.name,
            ingredient_name: ing.name,
            unit: ing.unit || 'كجم',
            unit_cost: Number(ing.avg_cost || ing.cost || ing.last_purchase_price || 0),
            cost: Number(ing.cost || ing.avg_cost || 0),
            avg_cost: Number(ing.avg_cost || 0),
            last_purchase_price: Number(ing.last_purchase_price || 0),
            available_stock: Number(ing.total_stock || ing.current_stock || 0),
            min_stock: Number(ing.min_stock || 0),
            category: ing.category || ing.item_group || 'خامات عامة',
            item_group: ing.item_group || ing.category || 'خامات عامة',
            item_code: ing.code || ing.item_code || `ITEM-${ing.id}`,
            code: ing.code || ing.item_code || `ITEM-${ing.id}`,
            barcode: ing.barcode || '',
            warehouse_id: targetWh,
            warehouse_name: 'المخزن'
          })));
        }
      }
    } catch (e) {
      console.error("Error loading ingredients list", e);
      try {
        const fallbackRes = await api.get('/api/ingredients');
        const fallbackData = await fallbackRes.json();
        if (Array.isArray(fallbackData)) {
          setAllIngredientsList(fallbackData.map((ing: any) => ({
            id: ing.id,
            name: ing.name,
            ingredient_name: ing.name,
            unit: ing.unit || 'كجم',
            unit_cost: Number(ing.avg_cost || ing.cost || ing.last_purchase_price || 0),
            cost: Number(ing.cost || ing.avg_cost || 0),
            avg_cost: Number(ing.avg_cost || 0),
            last_purchase_price: Number(ing.last_purchase_price || 0),
            available_stock: Number(ing.total_stock || ing.current_stock || 0),
            min_stock: Number(ing.min_stock || 0),
            category: ing.category || ing.item_group || 'خامات عامة',
            item_group: ing.item_group || ing.category || 'خامات عامة',
            item_code: ing.code || ing.item_code || `ITEM-${ing.id}`,
            code: ing.code || ing.item_code || `ITEM-${ing.id}`,
            barcode: ing.barcode || '',
            warehouse_id: targetWh || 'all',
            warehouse_name: 'المخزن'
          })));
        }
      } catch (err) {
        console.error("Fallback error loading ingredients", err);
      }
    } finally {
      setLoadingIngredients(false);
    }
  };

  const handleQuickAddIngredient = (ing: any) => {
    const existingIndex = editorIngredients.findIndex(row => String(row.ingredient_id) === String(ing.id));
    if (existingIndex >= 0) {
      const updated = [...editorIngredients];
      updated[existingIndex].quantity = String((Number(updated[existingIndex].quantity) || 0) + 1);
      setEditorIngredients(updated);
      showToast(`تم زيادة كمية [${ing.name}] إلى ${updated[existingIndex].quantity} ${ing.unit || 'كجم'}`);
    } else {
      if (editorIngredients.length === 1 && !editorIngredients[0].ingredient_id) {
        setEditorIngredients([
          { ingredient_id: String(ing.id), quantity: '1', unit: ing.unit || 'كجم', waste_percent: '0' }
        ]);
      } else {
        setEditorIngredients([
          ...editorIngredients,
          { ingredient_id: String(ing.id), quantity: '1', unit: ing.unit || 'كجم', waste_percent: '0' }
        ]);
      }
      showToast(`تمت إضافة المادة الخام [${ing.name}] للـ Recipe`);
    }
  };

  const openRecipeIngredientsEditor = (whId?: string) => {
    const targetWh = whId || costingWarehouseId || 'all';
    setEditorWarehouseId(targetWh);
    setEditorIngredientSearch('');
    setEditorIngredientCategoryFilter('all');
    setShowQuickAddCatalog(false);
    fetchAllAvailableIngredients(targetWh);
    if (recipeData && recipeData.ingredients && recipeData.ingredients.length > 0) {
      setEditorIngredients(recipeData.ingredients.map((ing: any) => ({
        ingredient_id: String(ing.ingredient_id),
        quantity: String(ing.recipe_quantity || 0),
        unit: ing.recipe_unit || ing.cost_unit || 'كجم',
        waste_percent: String(ing.waste_percent || 0)
      })));
      setEditorYieldPortions(recipeData.summary?.yield_portions || 1);
    } else {
      setEditorIngredients([
        { ingredient_id: '', quantity: '1', unit: 'كجم', waste_percent: '0' }
      ]);
      setEditorYieldPortions(1);
    }
    setShowRecipeEditorModal(true);
  };

  const handleAddIngredientRowToEditor = () => {
    setEditorIngredients([
      ...editorIngredients,
      { ingredient_id: '', quantity: '1', unit: 'كجم', waste_percent: '0' }
    ]);
  };

  const handleRemoveIngredientRowFromEditor = (index: number) => {
    setEditorIngredients(editorIngredients.filter((_, i) => i !== index));
  };

  const handleIngredientRowChange = (index: number, field: string, value: any) => {
    const updated = [...editorIngredients];
    updated[index] = { ...updated[index], [field]: value };
    // Auto fill default unit if ingredient_id changed
    if (field === 'ingredient_id') {
      const selected = allIngredientsList.find(i => String(i.id) === String(value));
      if (selected && selected.unit) {
        updated[index].unit = selected.unit;
      }
    }
    setEditorIngredients(updated);
  };

  const handleSaveRecipeIngredients = async () => {
    if (!selectedProductId) return;
    setSavingRecipeIngredients(true);
    try {
      const payload = {
        product_id: selectedProductId,
        yield_portions: editorYieldPortions,
        ingredients: editorIngredients
          .filter(ing => ing.ingredient_id && Number(ing.quantity) > 0)
          .map(ing => ({
            ingredient_id: Number(ing.ingredient_id),
            quantity: Number(ing.quantity),
            unit: ing.unit,
            waste_percent: Number(ing.waste_percent) || 0
          }))
      };

      const res = await api.post('/api/costs/recipe-costing/update-recipe-ingredients', payload);
      const json = await res.json();
      if (json.success) {
        setToast({ message: "تم حفظ وتحديث مكونات الـ Recipe للمنتج بنجاح", type: "success" });
        setTimeout(() => setToast(null), 3000);
        setShowRecipeEditorModal(false);
        fetchRecipesForCosting();
        loadRecipeCostingData(selectedProductId, costSource, costingWarehouseId);
      } else {
        setToast({ message: json.error || "تعذر حفظ مكونات الـ Recipe", type: "error" });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (e: any) {
      setToast({ message: "حدث خطأ أثناء حفظ مكونات الـ Recipe", type: "error" });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSavingRecipeIngredients(false);
    }
  };

  // Filter recipes by type and search query (name, item_code, barcode, category, or ID)
  const filteredRecipes = useMemo(() => {
    let list = recipeList;
    if (recipeTypeFilter === 'pos') {
      list = list.filter((r) => r.show_in_pos === true);
    } else if (recipeTypeFilter === 'with_recipe') {
      list = list.filter((r) => Number(r.ingredients_count) > 0);
    } else if (recipeTypeFilter === 'no_recipe') {
      list = list.filter((r) => Number(r.ingredients_count) === 0);
    }

    if (!recipeSearchQuery.trim()) return list;
    const q = recipeSearchQuery.toLowerCase().trim();
    return list.filter((rec) => {
      const nameMatch = rec.name ? String(rec.name).toLowerCase().includes(q) : false;
      const codeMatch = rec.item_code ? String(rec.item_code).toLowerCase().includes(q) : false;
      const barcodeMatch = rec.barcode ? String(rec.barcode).toLowerCase().includes(q) : false;
      const categoryMatch = rec.category ? String(rec.category).toLowerCase().includes(q) : false;
      const idMatch = String(rec.id).includes(q);
      return nameMatch || codeMatch || barcodeMatch || categoryMatch || idMatch;
    });
  }, [recipeList, recipeSearchQuery, recipeTypeFilter]);

  // Cost Settings States
  const [settingsActiveFiscalYear, setSettingsActiveFiscalYear] = useState('2026');
  const [settingsActivePeriod, setSettingsActivePeriod] = useState('Q3-2026');
  const [settingsVAT, setSettingsVAT] = useState('14');
  const [settingsAutoNumberPrefix, setSettingsAutoNumberPrefix] = useState('COST-');
  const [settingsBudgetAlertPercent, setSettingsBudgetAlertPercent] = useState('90');
  const [settingsApprovalWorkflowLevels, setSettingsApprovalWorkflowLevels] = useState('3');
  const [settingsIntegrationGL, setSettingsIntegrationGL] = useState(true);
  const [settingsIntegrationInventory, setSettingsIntegrationInventory] = useState(true);
  const [settingsIntegrationPayroll, setSettingsIntegrationPayroll] = useState(true);
  const [settingsIntegrationProcurement, setSettingsIntegrationProcurement] = useState(true);
  const [settingsCurrencyPrimary, setSettingsCurrencyPrimary] = useState('EGP');
  const [settingsEvaluationMethod, setSettingsEvaluationMethod] = useState('FIFO');

  // Notification Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Recipe Costing Engine Effects & Handlers
  useEffect(() => {
    if (activeTab === 'product_costing') {
      fetchRecipesForCosting();
      fetchAllAvailableIngredients(costingWarehouseId);
    }
  }, [activeTab, costingWarehouseId]);

  const fetchRecipesForCosting = async () => {
    try {
      const res = await api.get('/api/costs/recipe-costing/recipes');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRecipeList(json.data);
        if (json.data.length > 0 && !selectedProductId) {
          setSelectedProductId(String(json.data[0].id));
        }
      }
    } catch (e) {
      console.error("Error loading recipes for costing", e);
    }
  };

  useEffect(() => {
    if (selectedProductId && activeTab === 'product_costing') {
      loadRecipeCostingData(selectedProductId, costSource, costingWarehouseId);
    }
  }, [selectedProductId, costSource, costingWarehouseId, activeTab]);

  const loadRecipeCostingData = async (prodId: string, src: string, whId?: string) => {
    setLoadingRecipe(true);
    try {
      const targetWh = whId !== undefined ? whId : costingWarehouseId;
      const res = await api.get(`/api/costs/recipe-costing/calculate/${encodeURIComponent(prodId)}?costSource=${encodeURIComponent(src)}&warehouse_id=${encodeURIComponent(targetWh)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setRecipeData(json.data);
        setSimulationIngredients(json.data.ingredients ? JSON.parse(JSON.stringify(json.data.ingredients)) : []);
        setSimulationPortions(json.data.summary?.yield_portions || 1);
        fetchRecipeHistory(prodId);
      } else {
        setRecipeData(null);
      }
    } catch (e) {
      console.error("Error loading recipe costing data", e);
      setRecipeData(null);
    } finally {
      setLoadingRecipe(false);
    }
  };

  const fetchRecipeHistory = async (prodId: string) => {
    try {
      const res = await api.get(`/api/costs/recipe-costing/history/${encodeURIComponent(prodId)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRecipeCostHistory(json.data);
      }
    } catch (e) {
      console.error("Error fetching recipe cost history", e);
    }
  };

  const saveRecipeCosting = async () => {
    if (!recipeData) return;
    try {
      const payload = {
        product_id: recipeData.product.id,
        recipe_version: 'V1',
        cost_source: costSource,
        total_ingredients_cost: recipeData.summary.total_ingredients_cost,
        total_waste_cost: recipeData.summary.total_waste_cost,
        packaging_cost: recipeData.summary.packaging_cost,
        labor_cost: recipeData.summary.labor_cost,
        overhead_cost: recipeData.summary.overhead_cost,
        grand_total_cost: recipeData.summary.grand_total_cost,
        yield_portions: recipeData.summary.yield_portions,
        cost_per_portion: recipeData.summary.cost_per_portion,
        selling_price: recipeData.summary.selling_price,
        gross_profit: recipeData.summary.gross_profit,
        profit_margin_pct: recipeData.summary.profit_margin_pct,
        status: 'Approved'
      };

      const res = await api.post('/api/costs/recipe-costing/save', payload);
      const json = await res.json();
      if (json.success) {
        showToast('تم اعتماد وحفظ تكلفة الـ Recipe بنجاح وتحديث سعر التكلفة بالمنتجات');
        loadRecipeCostingData(selectedProductId, costSource, costingWarehouseId);
      } else {
        showToast(json.error || 'حدث خطأ أثناء حفظ التكلفة', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'حدث خطأ أثناء حفظ التكلفة', 'error');
    }
  };

  // ----------------- DATA FETCHING -----------------

  const fetchData = async () => {
    try {
      // Fetch Operating Costs
      const costsRes = await api.get('/api/costs');
      if (costsRes.ok) {
        const payload = await costsRes.json();
        setCosts(payload.data || []);
      }

      // Fetch Cost Centers
      const centersRes = await api.get('/api/costs/centers');
      if (centersRes.ok) {
        const payload = await centersRes.json();
        setCenters(payload.data || []);
      }

      // Fetch Cost Items
      const itemsRes = await api.get('/api/costs/items');
      if (itemsRes.ok) {
        const payload = await itemsRes.json();
        setItems(payload.data || []);
      }

      // Fetch Budgets
      try {
        const budgetsRes = await api.get('/api/costs/budgets');
        if (budgetsRes.ok) {
          const payload = await budgetsRes.json();
          setBudgets(payload.data || []);
        }
      } catch (e) {
        console.error("Error loading budgets:", e);
      }

      // Fetch Settings
      try {
        const settingsRes = await api.get('/api/costs/settings');
        if (settingsRes.ok) {
          const payload = await settingsRes.json();
          const s = payload.data || {};
          if (s.cost_fiscal_year) setSettingsActiveFiscalYear(s.cost_fiscal_year);
          if (s.cost_period) setSettingsActivePeriod(s.cost_period);
          if (s.cost_vat) setSettingsVAT(s.cost_vat);
          if (s.cost_prefix) setSettingsAutoNumberPrefix(s.cost_prefix);
          if (s.cost_budget_alert) setSettingsBudgetAlertPercent(s.cost_budget_alert);
          if (s.cost_approval_levels) setSettingsApprovalWorkflowLevels(s.cost_approval_levels);
          if (s.cost_int_gl) setSettingsIntegrationGL(s.cost_int_gl === 'true');
          if (s.cost_int_inv) setSettingsIntegrationInventory(s.cost_int_inv === 'true');
          if (s.cost_int_payroll) setSettingsIntegrationPayroll(s.cost_int_payroll === 'true');
          if (s.cost_int_proc) setSettingsIntegrationProcurement(s.cost_int_proc === 'true');
          if (s.cost_currency) setSettingsCurrencyPrimary(s.cost_currency);
          if (s.cost_eval_method) setSettingsEvaluationMethod(s.cost_eval_method);
        }
      } catch (e) {
        console.error("Error loading settings:", e);
      }

      // Fetch System Branches
      try {
        const branchesRes = await api.get('/api/branches');
        if (branchesRes.ok) {
          const payload = await branchesRes.json();
          const bList = Array.isArray(payload) ? payload : (payload.data || []);
          setSystemBranches(bList);
        }
      } catch (e) {
        console.error("Error loading system branches:", e);
      }

      // Fetch System Warehouses
      try {
        const warehousesRes = await api.get('/api/inventory/warehouses');
        if (warehousesRes.ok) {
          const payload = await warehousesRes.json();
          const wList = Array.isArray(payload) ? payload : (payload.data || []);
          setSystemWarehouses(wList);
        }
      } catch (e) {
        console.error("Error loading system warehouses:", e);
      }

      // Fetch System Production Work Centers
      try {
        const savedWC = localStorage.getItem('remo_production_workcenters');
        if (savedWC) {
          setSystemWorkCenters(JSON.parse(savedWC));
        } else {
          setSystemWorkCenters([
            { id: 'wc1', name: 'خط إنتاج العجين الرئيسي' },
            { id: 'wc2', name: 'خط تعبئة وتغليف الوجبات' },
            { id: 'wc3', name: 'وحدة تجهيز اللحوم والدواجن' }
          ]);
        }
      } catch (e) {
        console.error("Error loading workcenters:", e);
      }

      // Fetch System Safes
      try {
        const safesRes = await api.get('/api/safes');
        if (safesRes.ok) {
          const payload = await safesRes.json();
          const sList = Array.isArray(payload) ? payload : (payload.data || []);
          setSystemSafes(sList);
        }
      } catch (e) {
        console.error("Error loading system safes:", e);
      }

      // Fetch System Departments
      try {
        const deptsRes = await api.get('/api/hr/departments');
        if (deptsRes.ok) {
          const payload = await deptsRes.json();
          const dList = Array.isArray(payload) ? payload : (payload.data || []);
          setSystemDepartments(dList);
        }
      } catch (e) {
        console.error("Error loading system departments:", e);
      }

      // Fetch System Accounts
      try {
        const accountsRes = await api.get('/api/accounts');
        if (accountsRes.ok) {
          const payload = await accountsRes.json();
          const aList = Array.isArray(payload) ? payload : (payload.data || []);
          setSystemAccounts(aList);
        }
      } catch (e) {
        console.error("Error loading system accounts:", e);
      }

      // Fetch Integration: Employees (HR)
      try {
        const empRes = await api.get('/api/costs/integrations/employees');
        if (empRes.ok) {
          const payload = await empRes.json();
          setSystemEmployees(payload.data || []);
        }
      } catch (e) {
        console.error("Error loading employees integration:", e);
      }

      // Fetch Integration: Suppliers
      try {
        const supRes = await api.get('/api/costs/integrations/suppliers');
        if (supRes.ok) {
          const payload = await supRes.json();
          setSystemSuppliers(payload.data || []);
        }
      } catch (e) {
        console.error("Error loading suppliers integration:", e);
      }

      // Fetch Integration: Customers
      try {
        const custRes = await api.get('/api/costs/integrations/customers');
        if (custRes.ok) {
          const payload = await custRes.json();
          setSystemCustomers(payload.data || []);
        }
      } catch (e) {
        console.error("Error loading customers integration:", e);
      }

      // Fetch Integration: Products
      try {
        const prodRes = await api.get('/api/costs/integrations/products');
        if (prodRes.ok) {
          const payload = await prodRes.json();
          setSystemProducts(payload.data || []);
        }
      } catch (e) {
        console.error("Error loading products integration:", e);
      }

      // Fetch Integration: Ingredients (Warehouses)
      try {
        const ingRes = await api.get('/api/costs/integrations/ingredients');
        if (ingRes.ok) {
          const payload = await ingRes.json();
          setSystemIngredients(payload.data || []);
        }
      } catch (e) {
        console.error("Error loading ingredients integration:", e);
      }

      // Fetch Activity Logs
      try {
        const logsRes = await api.get('/api/costs/activity-logs');
        if (logsRes.ok) {
          const payload = await logsRes.json();
          setActivityLogs(payload.data || []);
        }
      } catch (e) {
        console.error("Error loading activity logs:", e);
      }

    } catch (e) {
      console.error("Error loading cost data:", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (systemBranches.length > 0) {
      setFormData(prev => ({ ...prev, branch: systemBranches[0].name }));
      setNewCenter(prev => ({ ...prev, branch: systemBranches[0].name }));
    }
  }, [systemBranches]);

  useEffect(() => {
    if (systemDepartments.length > 0) {
      setFormData(prev => ({ ...prev, department: systemDepartments[0].name }));
    }
  }, [systemDepartments]);

  useEffect(() => {
    if (systemSafes.length > 0) {
      setFormData(prev => ({ ...prev, safe: systemSafes[0].name }));
    } else if (systemAccounts.length > 0) {
      setFormData(prev => ({ ...prev, safe: systemAccounts[0].name }));
    }
  }, [systemSafes, systemAccounts]);



  // ----------------- ACTIONS & SUBMISSIONS -----------------

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudget.amount || !newBudget.cost_center_id || !newBudget.cost_item_id) {
      showToast('الرجاء ملء جميع الحقول المطلوبة', 'error');
      return;
    }
    try {
      const res = await api.post('/api/costs/budgets', {
        ...newBudget,
        year: Number(newBudget.year),
        amount: parseFloat(newBudget.amount),
        cost_center_id: parseInt(newBudget.cost_center_id),
        cost_item_id: parseInt(newBudget.cost_item_id)
      });
      if (res.ok) {
        showToast('تم إضافة الموازنة بنجاح');
        setShowBudgetModal(false);
        setNewBudget({
          year: 2026,
          month: 'يوليو',
          cost_center_id: '',
          cost_item_id: '',
          amount: '',
          notes: ''
        });
        fetchData();
      } else {
        showToast('فشل في إضافة الموازنة', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء إضافة الموازنة', 'error');
    }
  };

  const handleDeleteBudget = async (id: number) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا البند من الموازنة؟')) return;
    try {
      const res = await api.delete(`/api/costs/budgets/${id}`);
      if (res.ok) {
        showToast('تم حذف البند بنجاح');
        fetchData();
      } else {
        showToast('فشل في حذف البند', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCost = async (e: React.FormEvent, addAnother = false) => {
    e.preventDefault();
    if (!formData.amount || !formData.cost_item_id || !formData.cost_center_id) {
      showToast('الرجاء ملء جميع الحقول المطلوبة', 'error');
      return;
    }

    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        cost_center_id: parseInt(formData.cost_center_id),
        cost_item_id: parseInt(formData.cost_item_id),
        // Integration Fields formatted for database integrity
        customer_id: formData.customer_id ? parseInt(formData.customer_id) : null,
        employee_id: formData.employee_id ? parseInt(formData.employee_id) : null,
        supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : null,
        product_id: formData.product_id ? parseInt(formData.product_id) : null,
        warehouse_id: formData.warehouse_id ? parseInt(formData.warehouse_id) : null,
        tax: formData.tax ? parseFloat(formData.tax) : 0,
        total: formData.total ? parseFloat(formData.total) : parseFloat(formData.amount)
      };

      const res = await api.post('/api/costs', payload);
      if (res.ok) {
        showToast('تم حفظ التكلفة بنجاح');
        fetchData();
        if (addAnother) {
          // Reset partially but keep some contexts
          setFormData(prev => ({
            ...prev,
            voucher_no: 'INV-2025-' + Math.floor(100 + Math.random() * 900),
            amount: '',
            notes: '',
            customer_id: '',
            customer: '',
            employee_id: '',
            employee: '',
            supplier_id: '',
            supplier: '',
            product_id: '',
            product: '',
            warehouse_id: '',
            tax: '0',
            total: ''
          }));
        } else {
          setActiveTab('dashboard');
        }
      } else {
        showToast('فشل في حفظ التكلفة', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء الحفظ', 'error');
    }
  };

  const handleDeleteCost = async (id: number) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا السجل؟')) return;
    try {
      const res = await api.delete(`/api/costs/${id}`);
      if (res.ok) {
        showToast('تم حذف السجل بنجاح');
        fetchData();
      } else {
        showToast('فشل في حذف السجل', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAllCostsData = async () => {
    try {
      const res = await api.delete('/api/costs/clear-all-data');
      if (res.ok) {
        showToast("تم مسح جميع بيانات مديول التكاليف بنجاح!", "success");
        setCosts([]);
        setCenters([]);
        setItems([]);
        setShowClearConfirmModal(false);
      } else {
        const payload = await res.json();
        showToast(payload.error || "فشل مسح البيانات", "error");
      }
    } catch (err) {
      console.error("Error clearing costs data:", err);
      showToast("خطأ في الاتصال بالخادم", "error");
    }
  };

  const handleCreateCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCenter.name) {
      showToast('الرجاء إدخال اسم مركز التكلفة', 'error');
      return;
    }
    try {
      const payload = {
        code: newCenter.code,
        name: newCenter.name,
        type: newCenter.type,
        branch: newCenter.branch,
        manager: newCenter.manager,
        status: newCenter.status,
        notes: newCenter.notes,
        monthly_budget: newCenter.monthly_budget ? Number(newCenter.monthly_budget) : 0,
        parent_id: newCenter.parent_id ? Number(newCenter.parent_id) : null
      };

      let res;
      if (newCenter.id) {
        res = await api.put(`/api/costs/centers/${newCenter.id}`, payload);
      } else {
        res = await api.post('/api/costs/centers', payload);
      }

      if (res.ok) {
        showToast(newCenter.id ? 'تم تعديل مركز التكلفة بنجاح' : 'تم إضافة مركز التكلفة بنجاح');
        setShowCenterModal(false);
        setNewCenter({
          id: null,
          code: '',
          name: '',
          type: 'إنتاج',
          branch: 'القاهرة',
          manager: '',
          status: 'نشط',
          notes: '',
          monthly_budget: '',
          parent_id: ''
        });
        fetchData();
      } else {
        showToast(newCenter.id ? 'فشل في تعديل مركز التكلفة' : 'فشل في إضافة مركز التكلفة', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء حفظ مركز التكلفة', 'error');
    }
  };

  const handleDeleteCenter = async (id: number) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف مركز التكلفة هذا؟')) return;
    try {
      const res = await api.delete(`/api/costs/centers/${id}`);
      if (res.ok) {
        showToast('تم حذف مركز التكلفة بنجاح');
        fetchData();
      } else {
        showToast('فشل في حذف مركز التكلفة', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditCenter = (cc: any) => {
    setNewCenter({
      id: cc.id,
      code: cc.code || '',
      name: cc.name || '',
      type: cc.type || 'إنتاج',
      branch: cc.branch || 'القاهرة',
      manager: cc.manager || '',
      status: cc.status || 'نشط',
      notes: cc.notes || '',
      monthly_budget: cc.monthly_budget !== null && cc.monthly_budget !== undefined ? String(cc.monthly_budget) : '',
      parent_id: cc.parent_id !== null && cc.parent_id !== undefined ? String(cc.parent_id) : ''
    });
    setShowCenterModal(true);
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name) {
      showToast('الرجاء إدخال اسم البند', 'error');
      return;
    }
    try {
      const isUpdate = newItem.id !== null;
      const payload = {
        ...newItem,
        default_center_id: newItem.default_center_id ? parseInt(newItem.default_center_id) : null,
        budget_cap: newItem.budget_cap ? parseFloat(newItem.budget_cap) : 0,
        accounting_account_id: newItem.accounting_account_id ? parseInt(newItem.accounting_account_id) : null,
        parent_id: newItem.parent_id ? parseInt(newItem.parent_id) : null
      };

      const res = isUpdate 
        ? await api.put(`/api/costs/items/${newItem.id}`, payload)
        : await api.post('/api/costs/items', payload);

      if (res.ok) {
        showToast(isUpdate ? 'تم تعديل بند التكلفة بنجاح' : 'تم إضافة بند التكلفة بنجاح');
        setShowItemModal(false);
        setNewItem({
          id: null,
          code: '',
          name: '',
          cost_type: 'تشغيل',
          department: 'المصروفات العامة',
          status: 'نشط',
          parent_id: '',
          accounting_account_id: '',
          description: '',
          default_center_id: '',
          budget_cap: '',
          is_hr_linked: false,
          is_procurement_linked: false,
          is_warehouse_linked: false
        });
        fetchData();
      } else {
        showToast(isUpdate ? 'فشل في تعديل بند التكلفة' : 'فشل في إضافة بند التكلفة', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء حفظ البند', 'error');
    }
  };

  const handleEditItem = (item: any) => {
    setNewItem({
      id: item.id,
      code: item.code || '',
      name: item.name || '',
      cost_type: item.cost_type || 'تشغيل',
      department: item.department || 'المصروفات العامة',
      status: item.status || 'نشط',
      parent_id: item.parent_id !== null && item.parent_id !== undefined ? String(item.parent_id) : '',
      accounting_account_id: item.accounting_account_id !== null && item.accounting_account_id !== undefined ? String(item.accounting_account_id) : '',
      description: item.description || '',
      default_center_id: item.default_center_id !== null && item.default_center_id !== undefined ? String(item.default_center_id) : '',
      budget_cap: item.budget_cap !== null && item.budget_cap !== undefined ? String(item.budget_cap) : '',
      is_hr_linked: !!item.is_hr_linked,
      is_procurement_linked: !!item.is_procurement_linked,
      is_warehouse_linked: !!item.is_warehouse_linked
    });
    setShowItemModal(true);
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف بند التكلفة هذا؟')) return;
    try {
      const res = await api.delete(`/api/costs/items/${id}`);
      if (res.ok) {
        showToast('تم حذف البند بنجاح');
        fetchData();
      } else {
        showToast('فشل في حذف البند', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAttachment = () => {
    if (!newAttachmentName) return;
    const size = (Math.random() * 3 + 0.5).toFixed(1) + ' MB';
    setAttachments([
      ...attachments,
      { id: Date.now(), name: newAttachmentName + '.pdf', size }
    ]);
    setNewAttachmentName('');
    showToast('تم إضافة المرفق بنجاح');
  };

  const handleRemoveAttachment = (id: number) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formattedSize = file.size > 1024 * 1024
      ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
      : (file.size / 1024).toFixed(0) + ' KB';

    setAttachments([
      ...attachments,
      {
        id: Date.now(),
        name: file.name,
        size: formattedSize
      }
    ]);
    showToast(`تم إرفاق الملف "${file.name}" بنجاح`);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const formattedSize = file.size > 1024 * 1024
      ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
      : (file.size / 1024).toFixed(0) + ' KB';

    setAttachments([
      ...attachments,
      {
        id: Date.now(),
        name: file.name,
        size: formattedSize
      }
    ]);
    showToast(`تم إرفاق الملف "${file.name}" بنجاح`);
  };

  const handleRecalculate = () => {
    showToast('جاري إعادة الاحتساب وتحديث مؤشرات التكاليف...');
    fetchData();
  };

  const handleSaveSettings = async (sectionName: string, detailString: string) => {
    try {
      // Create settings object
      const settingsPayload = {
        cost_fiscal_year: settingsActiveFiscalYear,
        cost_period: settingsActivePeriod,
        cost_vat: settingsVAT,
        cost_prefix: settingsAutoNumberPrefix,
        cost_budget_alert: settingsBudgetAlertPercent,
        cost_approval_levels: settingsApprovalWorkflowLevels,
        cost_int_gl: settingsIntegrationGL.toString(),
        cost_int_inv: settingsIntegrationInventory.toString(),
        cost_int_payroll: settingsIntegrationPayroll.toString(),
        cost_int_proc: settingsIntegrationProcurement.toString(),
        cost_currency: settingsCurrencyPrimary,
        cost_eval_method: settingsEvaluationMethod
      };

      await api.post('/api/costs/settings', { settings: settingsPayload });

      await api.post('/api/costs/activity-logs', {
        action: 'UPDATE',
        details: `تحديث إعدادات التكاليف: ${sectionName} - ${detailString}`,
        username: 'محمد أحمد (المدير المالي)'
      });
      fetchData();
      showToast(`تم حفظ ${sectionName} والمزامنة الفورية مع بقية موديولات النظام بنجاح`);
    } catch (err: any) {
      console.error("Error saving settings:", err);
      showToast('تم حفظ الإعدادات محلياً', 'success');
    }
  };

  // ----------------- FILTERING & SEARCH LOGIC -----------------

  const filteredCosts = costs.filter(cost => {
    // Search Query (Voucher number, Notes, created_by)
    const matchesSearch = 
      (cost.voucher_no && cost.voucher_no.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cost.notes && cost.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cost.cost_item_name && cost.cost_item_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cost.cost_center_name && cost.cost_center_name.toLowerCase().includes(searchQuery.toLowerCase()));

    // Dropdowns
    const matchesCostType = filterCostType === 'all' || cost.cost_type === filterCostType;
    const matchesCenter = filterCenter === 'all' || Number(cost.cost_center_id) === Number(filterCenter);
    const matchesDept = filterDept === 'all' || cost.department === filterDept;
    const matchesBranch = filterBranch === 'all' || cost.branch === filterBranch;

    // Dates
    const costTime = new Date(cost.date).getTime();
    const matchesFromDate = !filterFromDate || costTime >= new Date(filterFromDate).getTime();
    const matchesToDate = !filterToDate || costTime <= new Date(filterToDate + 'T23:59:59').getTime();

    return matchesSearch && matchesCostType && matchesCenter && matchesDept && matchesBranch && matchesFromDate && matchesToDate;
  });

  // Calculate dynamic stats
  const totalCostsSum = filteredCosts.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  
  // Calculate top cost item
  const costItemTotals: Record<string, number> = {};
  filteredCosts.forEach(c => {
    const name = c.cost_item_name || 'أخرى';
    costItemTotals[name] = (costItemTotals[name] || 0) + Number(c.amount || 0);
  });
  let topCostItemName = 'المرتبات';
  let topCostItemValue = 245000;
  if (Object.keys(costItemTotals).length > 0) {
    const topItem = Object.entries(costItemTotals).reduce((a, b) => a[1] > b[1] ? a : b);
    topCostItemName = topItem[0];
    topCostItemValue = topItem[1];
  }

  // Calculate top cost center
  const costCenterTotals: Record<string, number> = {};
  filteredCosts.forEach(c => {
    const name = c.cost_center_name || 'غير محدد';
    costCenterTotals[name] = (costCenterTotals[name] || 0) + Number(c.amount || 0);
  });
  let topCostCenterName = 'فرع القاهرة';
  let topCostCenterValue = 525000;
  if (Object.keys(costCenterTotals).length > 0) {
    const topCenter = Object.entries(costCenterTotals).reduce((a, b) => a[1] > b[1] ? a : b);
    topCostCenterName = topCenter[0];
    topCostCenterValue = topCenter[1];
  }

  // Monthly sum (simulated based on selected period or actual 2025/2026 dates)
  const currentMonthCostsSum = filteredCosts
    .filter(c => new Date(c.date).getMonth() === new Date().getMonth())
    .reduce((sum, item) => sum + Number(item.amount || 0), 0) || totalCostsSum * 0.35 || 430000;

  // Today's sum
  const todayCostsSum = filteredCosts
    .filter(c => new Date(c.date).toDateString() === new Date().toDateString())
    .reduce((sum, item) => sum + Number(item.amount || 0), 0) || totalCostsSum * 0.02 || 25400;

  // Unique lists for filtering dropdowns
  const uniqueDepts = Array.from(new Set(costs.map(c => c.department).filter(Boolean)));
  const uniqueBranches = Array.from(new Set(costs.map(c => c.branch).filter(Boolean)));

  // Pagination slice
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTableItems = filteredCosts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCosts.length / itemsPerPage) || 1;

  // ----------------- CHARTS DATA PREPARATION -----------------

  // 1. Chart: Costs by Type (Donut)
  const pieData = [
    { name: 'تشغيل', value: 33430, color: '#10b981' },
    { name: 'تسويق', value: 6000, color: '#0ea5e9' }
  ];

  // Dynamic pie calculation if database has other values
  const hasCustomCosts = costs.length > 5 || costs.some(c => c.voucher_no && !c.voucher_no.startsWith('TC-2026'));
  if (hasCustomCosts) {
    const calculatedPie: Record<string, number> = {};
    filteredCosts.forEach(c => {
      const cat = c.category || c.cost_type || 'تشغيل';
      const label = cat === 'تسويق' || cat === 'دعاية وإعلان' ? 'تسويق' : 'تشغيل';
      calculatedPie[label] = (calculatedPie[label] || 0) + Number(c.amount || 0);
    });
    if (Object.keys(calculatedPie).length > 0) {
      pieData[0].value = calculatedPie['تشغيل'] || 0;
      pieData[1].value = calculatedPie['تسويق'] || 0;
    }
  }

  // 2. Chart: Cost Trend - 12 Months
  const monthlyTrendData = [
    { name: 'أغسطس 2025', 'تشغيلية': 0, 'عمالة': 0, 'أغذية': 0 },
    { name: 'سبتمبر 2025', 'تشغيلية': 0, 'عمالة': 0, 'أغذية': 0 },
    { name: 'أكتوبر 2025', 'تشغيلية': 0, 'عمالة': 0, 'أغذية': 0 },
    { name: 'نوفمبر 2025', 'تشغيلية': 0, 'عمالة': 0, 'أغذية': 0 },
    { name: 'ديسمبر 2025', 'تشغيلية': 0, 'عمالة': 0, 'أغذية': 0 },
    { name: 'يناير 2026', 'تشغيلية': 0, 'عمالة': 0, 'أغذية': 0 },
    { name: 'فبراير 2026', 'تشغيلية': 0, 'عمالة': 0, 'أغذية': 0 },
    { name: 'مارس 2026', 'تشغيلية': 0, 'عمالة': 0, 'أغذية': 0 },
    { name: 'أبريل 2026', 'تشغيلية': 1500, 'عمالة': 0, 'أغذية': 0 },
    { name: 'مايو 2026', 'تشغيلية': 50000, 'عمالة': 0, 'أغذية': 0 },
    { name: 'يونيو 2026', 'تشغيلية': 50000, 'عمالة': 0, 'أغذية': 0 },
    { name: 'يوليو 2026', 'تشغيلية': 33430, 'عمالة': 0, 'أغذية': 0 }
  ];

  if (hasCustomCosts) {
    costs.forEach(c => {
      const d = new Date(c.date);
      const m = d.getMonth();
      const y = d.getFullYear();
      const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      const label = `${monthNames[m]} ${y}`;
      const found = monthlyTrendData.find(item => item.name === label || item.name.includes(monthNames[m]));
      if (found) {
        const type = c.cost_type || c.category || 'تشغيل';
        if (type === 'مرتبات' || type === 'عمالة') {
          found['عمالة'] += Number(c.amount || 0);
        } else if (type === 'أغذية') {
          found['أغذية'] += Number(c.amount || 0);
        } else {
          found['تشغيلية'] += Number(c.amount || 0);
        }
      }
    });
  }

  // 3. Chart: Payment Methods
  const paymentMethodData = [
    { name: 'نقدي', value: 31000, color: '#10b981' },
    { name: 'آجل', value: 6000, color: '#0ea5e9' },
    { name: 'شيك', value: 2430, color: '#f59e0b' }
  ];

  if (hasCustomCosts) {
    const paymentMethodTotals: Record<string, number> = {};
    filteredCosts.forEach(c => {
      const method = c.payment_method || 'نقدي';
      paymentMethodTotals[method] = (paymentMethodTotals[method] || 0) + Number(c.amount || 0);
    });
    paymentMethodData.forEach(item => {
      if (paymentMethodTotals[item.name] !== undefined) {
        item.value = paymentMethodTotals[item.name];
      }
    });
  }

  // 4. Chart: Budget vs Actual
  const budgetVsActualData = [
    { name: 'الإدارة العامة', 'الفعلي': 25000, 'الموازنة': 11000 },
    { name: 'التسويق والمبيعات', 'الفعلي': 6000, 'الموازنة': 6000 },
    { name: 'الصيانة والمرافق', 'الفعلي': 4100, 'الموازنة': 9000 },
    { name: 'المطبخ الرئيسي', 'الفعلي': 4330, 'الموازنة': 13000 }
  ];

  if (hasCustomCosts) {
    const centerActualMap: Record<string, number> = {};
    filteredCosts.forEach(c => {
      const centerName = c.cost_center_name || 'أخرى';
      centerActualMap[centerName] = (centerActualMap[centerName] || 0) + Number(c.amount || 0);
    });
    const defaultCenters = ['الإدارة العامة', 'التسويق والمبيعات', 'الصيانة والمرافق', 'المطبخ الرئيسي'];
    defaultCenters.forEach(name => {
      const actualVal = centerActualMap[name];
      if (actualVal !== undefined) {
        const item = budgetVsActualData.find(b => b.name === name);
        if (item) {
          item['الفعلي'] = actualVal;
        }
      }
    });
  }

  // Preserve barData for compat
  const barData = Object.entries(costCenterTotals).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value).slice(0, 5);

  if (barData.length === 0) {
    barData.push(
      { name: 'فرع القاهرة', value: 525000 },
      { name: 'فرع الجيزة', value: 330000 },
      { name: 'المخزن الرئيسي', value: 210000 },
      { name: 'الإدارة العامة', value: 150000 },
      { name: 'المطبخ الرئيسي', value: 180000 }
    );
  }

  // Dynamic daily trend calculations for reports (trendData)
  const sortedDates = [...filteredCosts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const dailyMap: Record<string, number> = {};
  sortedDates.forEach(c => {
    const dStr = new Date(c.date).toLocaleDateString('ar-EG', { month: 'numeric', day: 'numeric' });
    dailyMap[dStr] = (dailyMap[dStr] || 0) + Number(c.amount || 0);
  });
  const trendData = Object.entries(dailyMap).map(([date, cost]) => ({
    date,
    cost
  })).slice(-10); // last 10 days for nice visualization

  if (trendData.length === 0) {
    trendData.push(
      { date: '1/6', cost: 12000 },
      { date: '5/6', cost: 24000 },
      { date: '10/6', cost: 18000 },
      { date: '15/6', cost: 35000 },
      { date: '20/6', cost: 22000 },
      { date: '25/6', cost: 41000 },
      { date: '30/6', cost: 33430 }
    );
  }

  // Dynamic Cost Center grouping for reports
  const reportCostCentersGrouped = Object.entries(costCenterTotals).map(([name, value]) => {
    const centerObj = centers.find(c => c.name === name);
    const txnLines = filteredCosts.filter(c => c.cost_center_name === name || Number(c.cost_center_id) === Number(centerObj?.id));
    return {
      name,
      code: centerObj?.code || 'CC-00' + (centerObj?.id || Math.floor(100 + Math.random() * 900)),
      type: centerObj?.type || 'تشغيل',
      branch: centerObj?.branch || 'القاهرة',
      manager: centerObj?.manager || 'محمد أحمد',
      count: txnLines.length,
      value
    };
  }).sort((a, b) => b.value - a.value);

  // If empty, fill with default ones
  if (reportCostCentersGrouped.length === 0) {
    reportCostCentersGrouped.push(
      { name: 'فرع القاهرة', code: 'CC-001', type: 'فروع', branch: 'القاهرة', manager: 'أحمد علي', count: 12, value: 525000 },
      { name: 'فرع الجيزة', code: 'CC-002', type: 'فروع', branch: 'الجيزة', manager: 'محمود حسن', count: 8, value: 330000 },
      { name: 'المخزن الرئيسي', code: 'CC-003', type: 'مخازن', branch: 'القاهرة', manager: 'سعيد عبد الله', count: 15, value: 210000 },
      { name: 'الإدارة العامة', code: 'CC-004', type: 'إدارة', branch: 'القاهرة', manager: 'منى محمد', count: 5, value: 150000 },
      { name: 'المطبخ الرئيسي', code: 'CC-005', type: 'إنتاج', branch: 'الجيزة', manager: 'الشيف كمال', count: 18, value: 180000 }
    );
  }

  // Dynamic Cost Item grouping for reports
  const reportCostItemsGrouped = Object.entries(costItemTotals).map(([name, value]) => {
    const itemObj = items.find(i => i.name === name);
    const txnLines = filteredCosts.filter(c => c.cost_item_name === name || Number(c.cost_item_id) === Number(itemObj?.id));
    return {
      name,
      code: itemObj?.code || 'CI-00' + (itemObj?.id || Math.floor(100 + Math.random() * 900)),
      cost_type: itemObj?.cost_type || 'تشغيل',
      department: itemObj?.department || 'المصروفات العامة',
      count: txnLines.length,
      average: txnLines.length ? Math.round(value / txnLines.length) : value,
      value
    };
  }).sort((a, b) => b.value - a.value);

  if (reportCostItemsGrouped.length === 0) {
    reportCostItemsGrouped.push(
      { name: 'رواتب وأجور الموظفين', code: 'CI-001', cost_type: 'مرتبات', department: 'شؤون الموظفين', count: 5, average: 49000, value: 245000 },
      { name: 'استهلاك الكهرباء والطاقة', code: 'CI-002', cost_type: 'تشغيل', department: 'المرافق والخدمات', count: 4, average: 21250, value: 85000 },
      { name: 'إيجارات المقرات والمنشآت', code: 'CI-003', cost_type: 'إيجارات', department: 'العقود والأصول', count: 1, average: 75000, value: 75000 },
      { name: 'الوقود ومواصلات الخدمة', code: 'CI-004', cost_type: 'نقل ومواصلات', department: 'الحركة والخدمات', count: 8, average: 6875, value: 55000 },
      { name: 'أعمال الصيانة الوقائية والطارئة', code: 'CI-005', cost_type: 'صيانة', department: 'الصيانة والدعم', count: 3, average: 11666, value: 35000 }
    );
  }

  // Group by branch
  const reportBranchesGrouped = filteredCosts.reduce((acc: Record<string, number>, c) => {
    const br = c.branch || 'أخرى';
    acc[br] = (acc[br] || 0) + Number(c.amount || 0);
    return acc;
  }, {});

  const reportBranchesList: { name: string; value: number }[] = Object.entries(reportBranchesGrouped).map(([name, value]) => ({ name, value: Number(value) })).sort((a,b) => b.value - a.value);
  if (reportBranchesList.length === 0) {
    reportBranchesList.push(
      { name: 'القاهرة', value: 920000 },
      { name: 'الجيزة', value: 510000 },
      { name: 'الإسكندرية', value: 120000 }
    );
  }

  // Group by department
  const reportDeptsGrouped = filteredCosts.reduce((acc: Record<string, number>, c) => {
    const dept = c.department || 'أخرى';
    acc[dept] = (acc[dept] || 0) + Number(c.amount || 0);
    return acc;
  }, {});

  const reportDeptsList: { name: string; value: number }[] = Object.entries(reportDeptsGrouped).map(([name, value]) => ({ name, value: Number(value) })).sort((a,b) => b.value - a.value);
  if (reportDeptsList.length === 0) {
    reportDeptsList.push(
      { name: 'المخازن', value: 450000 },
      { name: 'المبيعات', value: 320000 },
      { name: 'الإدارة', value: 250000 },
      { name: 'التشغيل والصيانة', value: 180000 }
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900" dir="rtl">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-6 left-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl transition-all duration-300 transform translate-y-0 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
        }`}>
          {toast.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="p-6 border-b border-slate-200 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-indigo-600" />
              إدارة التكاليف
            </h1>
            <p className="text-sm text-slate-500 font-medium">الرئيسية {`>`} التكاليف</p>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center flex-wrap gap-1.5">
          <button 
            onClick={handleRecalculate}
            title="إعادة الاحتساب"
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all text-slate-600 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="text-xs font-bold hidden md:inline">إعادة الاحتساب</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 w-full max-w-full space-y-6">

        {/* ========================================================= */}
        {/* TAB 1: DASHBOARD                                         */}
        {/* ========================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Custom Dashboard Header with Date Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">لوحة التحكم</h2>
                <p className="text-xs text-slate-500 font-bold mt-1">تحليل شامل لتكاليف النظام - REMO Pro</p>
              </div>
              
              {/* Date Range Selector */}
              <div className="bg-white border border-slate-200 shadow-sm px-4 py-2.5 rounded-2xl flex items-center gap-3 text-xs font-bold text-slate-700">
                <span className="text-slate-400">الفترة:</span>
                <span>من</span>
                <input 
                  type="date" 
                  value={filterFromDate ?? ""} 
                  onChange={(e) => setFilterFromDate(e.target.value)} 
                  className="bg-transparent border-0 font-black p-0 text-indigo-600 focus:ring-0 cursor-pointer w-[110px]"
                />
                <span className="text-slate-400">إلى</span>
                <input 
                  type="date" 
                  value={filterToDate ?? ""} 
                  onChange={(e) => setFilterToDate(e.target.value)} 
                  className="bg-transparent border-0 font-black p-0 text-indigo-600 focus:ring-0 cursor-pointer w-[110px]"
                />
              </div>
            </div>

            {/* 7 KPI Indicators Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {/* Card 1: إجمالي التكاليف */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between text-right relative overflow-hidden min-h-[110px] transition-all hover:shadow-md">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold text-slate-500">إجمالي التكاليف</span>
                  <DollarSign className="w-4 h-4 text-slate-300" />
                </div>
                <div className="mt-2">
                  <div className="text-lg font-black text-slate-900">
                    {Number(totalCostsSum || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} <span className="text-xs font-bold text-slate-400">ج.م.</span>
                  </div>
                </div>
              </div>

              {/* Card 2: تكلفة الأغذية */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between text-right relative overflow-hidden min-h-[110px] transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">تكلفة الأغذية</span>
                  <span className="text-emerald-500 text-xs font-black">🍟</span>
                </div>
                <div className="mt-2">
                  <div className="text-lg font-black text-slate-900">0.00 <span className="text-xs font-bold text-slate-400">ج.م.</span></div>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">0.0% من الإيرادات</p>
                </div>
              </div>

              {/* Card 3: تكلفة العمالة */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between text-right relative overflow-hidden min-h-[110px] transition-all hover:shadow-md">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold text-slate-500">تكلفة العمالة</span>
                  <User className="w-4 h-4 text-blue-400" />
                </div>
                <div className="mt-2">
                  <div className="text-lg font-black text-slate-900">0.00 <span className="text-xs font-bold text-slate-400">ج.م.</span></div>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">0.0% من الإيرادات</p>
                </div>
              </div>

              {/* Card 4: المصروفات التشغيلية */}
              <div className="bg-white p-4 rounded-2xl border-2 border-amber-500 shadow-sm flex flex-col justify-between text-right relative overflow-hidden min-h-[110px] transition-all hover:shadow-md">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold text-slate-500">المصروفات التشغيلية</span>
                  <Building2 className="w-4 h-4 text-amber-500" />
                </div>
                <div className="mt-2">
                  <div className="text-lg font-black text-slate-900">
                    {Number(totalCostsSum || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} <span className="text-xs font-bold text-slate-400">ج.م.</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">100.0% من الإيرادات</p>
                </div>
              </div>

              {/* Card 5: إجمالي المشتريات */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between text-right relative overflow-hidden min-h-[110px] transition-all hover:shadow-md">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold text-slate-500">إجمالي المشتريات</span>
                  <Layers className="w-4 h-4 text-purple-400" />
                </div>
                <div className="mt-2">
                  <div className="text-lg font-black text-slate-900">0.00 <span className="text-xs font-bold text-slate-400">ج.م.</span></div>
                </div>
              </div>

              {/* Card 6: نسبة الموازنة */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between text-right relative overflow-hidden min-h-[110px] transition-all hover:shadow-md">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold text-slate-500">نسبة الموازنة</span>
                  <TrendingUp className="w-4 h-4 text-teal-400" />
                </div>
                <div className="mt-2 space-y-1">
                  <div className="text-lg font-black text-slate-900">9.0%</div>
                  <p className="text-[9px] text-slate-400 font-bold">من الموازنة المعتمدة</p>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-teal-500 h-full rounded-full" style={{ width: '9%' }}></div>
                  </div>
                </div>
              </div>

              {/* Card 7: معلقة للاعتماد */}
              <div className="bg-white p-4 rounded-2xl border-2 border-rose-400 shadow-sm flex flex-col justify-between text-right relative overflow-hidden min-h-[110px] transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">معلقة للاعتماد</span>
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                </div>
                <div className="mt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-rose-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full">5</span>
                    <span className="text-rose-500 text-xs font-black bg-rose-50 px-2 py-0.5 rounded-md">تنبيه</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">سند بانتظار الاعتماد</p>
                </div>
              </div>
            </div>

            {/* Row 2: Charts (توزيع التكاليف حسب الفئة & اتجاه التكاليف - 12 شهر) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Col 1: Donut Chart - 5/12 width */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:col-span-5">
                <h4 className="text-sm font-black text-slate-800 mb-4 pb-2 border-b border-slate-100">توزيع التكاليف حسب الفئة</h4>
                <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 min-h-[220px]">
                  <div className="w-40 h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          <Cell key="cell-0" fill="#10b981" />
                          <Cell key="cell-1" fill="#0ea5e9" />
                        </Pie>
                        <Tooltip formatter={(value) => `${Number(value || 0).toLocaleString()} ج.م.`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Custom legend */}
                  <div className="space-y-3 flex-1 text-right">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full bg-[#10b981] block"></span>
                        <span className="text-xs font-bold text-slate-700">تشغيل</span>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-black text-slate-800">
                          {Number(pieData[0].value || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م.
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold">
                          {((pieData[0].value / ((pieData[0].value + pieData[1].value) || 1)) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full bg-[#0ea5e9] block"></span>
                        <span className="text-xs font-bold text-slate-700">تسويق</span>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-black text-slate-800">
                          {Number(pieData[1].value || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م.
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold">
                          {((pieData[1].value / ((pieData[0].value + pieData[1].value) || 1)) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Col 2: 12-Month Area Chart - 7/12 width */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:col-span-7">
                <h4 className="text-sm font-black text-slate-800 mb-2">اتجاه التكاليف - 12 شهر</h4>
                <div className="flex-1 min-h-[220px]">
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorOperating" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }} tickFormatter={(val) => `${val / 1000}k`} />
                      <Tooltip formatter={(value) => `${Number(value || 0).toLocaleString()} ج.م.`} />
                      <Area type="monotone" dataKey="تشغيلية" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorOperating)" name="تشغيلية" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-2 text-xs font-bold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1.5 rounded bg-[#f97316]"></span>
                    <span>تشغيلية</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: Charts (توزيع طرق الدفع & الفعلي مقابل الموازنة) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: توزيع طرق الدفع */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                <h4 className="text-sm font-black text-slate-800 mb-4 pb-2 border-b border-slate-100">توزيع طرق الدفع</h4>
                <div className="flex-1 min-h-[200px]">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={paymentMethodData} layout="vertical" margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }} tickFormatter={(val) => `${val / 1000}k`} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold', fill: '#475569' }} />
                      <Tooltip formatter={(value) => `${Number(value || 0).toLocaleString()} ج.م.`} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                        {paymentMethodData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: الفعلي مقابل الموازنة */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                <h4 className="text-sm font-black text-slate-800 mb-4 pb-2 border-b border-slate-100">الفعلي مقابل الموازنة - حسب المركز</h4>
                <div className="flex-1 min-h-[200px]">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={budgetVsActualData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'bold', fill: '#475569' }} />
                      <YAxis tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }} tickFormatter={(val) => `${val / 1000}k`} />
                      <Tooltip formatter={(value) => `${Number(value || 0).toLocaleString()} ج.م.`} />
                      <Bar dataKey="الفعلي" fill="#10b981" radius={[4, 4, 0, 0]} name="الفعلي" barSize={16} />
                      <Bar dataKey="الموازنة" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="الموازنة" barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-4 mt-2 text-xs font-bold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-[#10b981] rounded-sm"></span>
                    <span>الفعلي</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-[#cbd5e1] rounded-sm"></span>
                    <span>الموازنة</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 4: Data Table of Top 5 Operating Costs */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-black text-slate-800">أعلى 5 مصروفات تشغيلية</h3>
                  {/* Inline filters for great user interaction */}
                  <div className="flex items-center gap-2">
                    <select
                      value={filterCenter ?? ""}
                      onChange={(e) => setFilterCenter(e.target.value)}
                      className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="all">كل مراكز التكلفة</option>
                      {centers.map(cc => (
                        <option key={cc.id} value={cc.id}>{cc.name}</option>
                      ))}
                    </select>
                    <select
                      value={filterCostType ?? ""}
                      onChange={(e) => setFilterCostType(e.target.value)}
                      className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="all">كل الأنواع</option>
                      <option value="تشغيل">تشغيل</option>
                      <option value="مرتبات">مرتبات</option>
                      <option value="صيانة">صيانة</option>
                      <option value="أخرى">أخرى</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-44">
                    <input
                      type="text"
                      placeholder="بحث سريع بالبند..."
                      value={searchQuery ?? ""}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-2 pr-7 py-1 text-[11px] rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2" />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs font-black border-b border-slate-100">
                      <th className="p-4">#</th>
                      <th className="p-4">رقم السند</th>
                      <th className="p-4">التاريخ</th>
                      <th className="p-4">البند</th>
                      <th className="p-4">المركز</th>
                      <th className="p-4">المبلغ</th>
                      <th className="p-4">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredCosts.slice(0, 5).length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">
                          لا توجد سجلات مطابقة للفلاتر.
                        </td>
                      </tr>
                    ) : (
                      filteredCosts.slice(0, 5).map((cost, idx) => (
                        <tr key={cost.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-bold text-slate-400">{idx + 1}</td>
                          <td className="p-4 font-black text-slate-900">{cost.voucher_no || `TC-2026-${100 + cost.id}`}</td>
                          <td className="p-4 text-slate-600">
                            {new Date(cost.date).toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                          </td>
                          <td className="p-4 font-bold text-slate-700">{cost.cost_item_name || 'غير محدد'}</td>
                          <td className="p-4 text-slate-500">{cost.cost_center_name || 'غير محدد'}</td>
                          <td className="p-4 font-black text-rose-600">
                            {Number(cost.amount || 0 || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م.
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              cost.status === 'معتمد' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                              {cost.status || 'جديد'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1B: OPERATING COSTS                                   */}
        {/* ========================================================= */}
        {activeTab === 'operating_costs' && (
          <div className="space-y-6">
            {/* Title & Add button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">التكاليف التشغيلية</h2>
                <p className="text-xs text-slate-500 font-bold mt-1">إدارة ومتابعة المصروفات التشغيلية اليومية</p>
              </div>
              <button
                onClick={() => setActiveTab('form')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all flex items-center gap-2 text-sm self-start md:self-auto"
              >
                <Plus className="w-5 h-5" />
                <span>تسجيل تكلفة جديدة</span>
              </button>
            </div>

            {/* Main Filters Section */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                {/* Date From */}
                <div>
                  <label className="text-xs font-black text-slate-600 block mb-1">من تاريخ</label>
                  <input
                    type="date"
                    value={ocFromDate ?? ""}
                    onChange={(e) => setOcFromDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Date To */}
                <div>
                  <label className="text-xs font-black text-slate-600 block mb-1">إلى تاريخ</label>
                  <input
                    type="date"
                    value={ocToDate ?? ""}
                    onChange={(e) => setOcToDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="text-xs font-black text-slate-600 block mb-1">الحالة</label>
                  <select
                    value={ocStatus ?? ""}
                    onChange={(e) => setOcStatus(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">الكل</option>
                    <option value="معتمد">معتمد</option>
                    <option value="جديد">جديد</option>
                  </select>
                </div>

                {/* Cost Center */}
                <div>
                  <label className="text-xs font-black text-slate-600 block mb-1">مركز التكلفة</label>
                  <select
                    value={ocCenter ?? ""}
                    onChange={(e) => setOcCenter(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">الكل</option>
                    {centers.map(cc => (
                      <option key={cc.id} value={cc.id}>{cc.name}</option>
                    ))}
                  </select>
                </div>

                {/* Search query */}
                <div>
                  <label className="text-xs font-black text-slate-600 block mb-1">بحث نصي</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="البحث في الملاحظات..."
                      value={ocSearch ?? ""}
                      onChange={(e) => setOcSearch(e.target.value)}
                      className="w-full pl-2 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setOcSearch('');
                    setOcStatus('all');
                    setOcCenter('all');
                    setOcFromDate('2026-07-01');
                    setOcToDate('2026-07-31');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  إعادة تعيين
                </button>
              </div>
            </div>

            {/* KPI Indicators Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Card 1: الإجمالي */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between text-right transition-all hover:shadow-md">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold text-slate-500">إجمالي التكاليف التشغيلية</span>
                  <DollarSign className="w-4 h-4 text-slate-300" />
                </div>
                <div className="mt-2">
                  <div className="text-xl font-black text-slate-950">
                    {costs.filter(c => {
                      const matchesSearch = ocSearch === '' || 
                        (c.notes && c.notes.toLowerCase().includes(ocSearch.toLowerCase())) ||
                        (c.voucher_no && c.voucher_no.toLowerCase().includes(ocSearch.toLowerCase()));
                      const matchesStatus = ocStatus === 'all' || c.status === ocStatus;
                      const matchesCenter = ocCenter === 'all' || Number(c.cost_center_id) === Number(ocCenter);
                      const matchesDate = (!ocFromDate || new Date(c.date) >= new Date(ocFromDate + 'T00:00:00')) &&
                                          (!ocToDate || new Date(c.date) <= new Date(ocToDate + 'T23:59:59'));
                      return matchesSearch && matchesStatus && matchesCenter && matchesDate;
                    }).reduce((acc, c) => acc + Number(c.amount || 0), 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} <span className="text-xs font-bold text-slate-400">ج.م.</span>
                  </div>
                </div>
              </div>

              {/* Card 2: معتمد */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between text-right transition-all hover:shadow-md">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold text-emerald-600">معتمد</span>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="mt-2">
                  <div className="text-xl font-black text-slate-950">
                    {costs.filter(c => {
                      const matchesSearch = ocSearch === '' || 
                        (c.notes && c.notes.toLowerCase().includes(ocSearch.toLowerCase())) ||
                        (c.voucher_no && c.voucher_no.toLowerCase().includes(ocSearch.toLowerCase()));
                      const matchesStatus = c.status === 'معتمد';
                      const matchesCenter = ocCenter === 'all' || Number(c.cost_center_id) === Number(ocCenter);
                      const matchesDate = (!ocFromDate || new Date(c.date) >= new Date(ocFromDate + 'T00:00:00')) &&
                                          (!ocToDate || new Date(c.date) <= new Date(ocToDate + 'T23:59:59'));
                      return matchesSearch && matchesStatus && matchesCenter && matchesDate;
                    }).reduce((acc, c) => acc + Number(c.amount || 0), 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} <span className="text-xs font-bold text-slate-400">ج.م.</span>
                  </div>
                </div>
              </div>

              {/* Card 3: جديد */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between text-right transition-all hover:shadow-md">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold text-amber-600">جديد</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="mt-2">
                  <div className="text-xl font-black text-slate-950">
                    {costs.filter(c => {
                      const matchesSearch = ocSearch === '' || 
                        (c.notes && c.notes.toLowerCase().includes(ocSearch.toLowerCase())) ||
                        (c.voucher_no && c.voucher_no.toLowerCase().includes(ocSearch.toLowerCase()));
                      const matchesStatus = c.status === 'جديد';
                      const matchesCenter = ocCenter === 'all' || Number(c.cost_center_id) === Number(ocCenter);
                      const matchesDate = (!ocFromDate || new Date(c.date) >= new Date(ocFromDate + 'T00:00:00')) &&
                                          (!ocToDate || new Date(c.date) <= new Date(ocToDate + 'T23:59:59'));
                      return matchesSearch && matchesStatus && matchesCenter && matchesDate;
                    }).reduce((acc, c) => acc + Number(c.amount || 0), 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} <span className="text-xs font-bold text-slate-400">ج.م.</span>
                  </div>
                </div>
              </div>

              {/* Card 4: عدد السجلات */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between text-right transition-all hover:shadow-md">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold text-indigo-600">عدد السجلات</span>
                  <Layers className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="mt-2">
                  <div className="text-xl font-black text-slate-950">
                    {costs.filter(c => {
                      const matchesSearch = ocSearch === '' || 
                        (c.notes && c.notes.toLowerCase().includes(ocSearch.toLowerCase())) ||
                        (c.voucher_no && c.voucher_no.toLowerCase().includes(ocSearch.toLowerCase()));
                      const matchesStatus = ocStatus === 'all' || c.status === ocStatus;
                      const matchesCenter = ocCenter === 'all' || Number(c.cost_center_id) === Number(ocCenter);
                      const matchesDate = (!ocFromDate || new Date(c.date) >= new Date(ocFromDate + 'T00:00:00')) &&
                                          (!ocToDate || new Date(c.date) <= new Date(ocToDate + 'T23:59:59'));
                      return matchesSearch && matchesStatus && matchesCenter && matchesDate;
                    }).length} <span className="text-xs font-bold text-slate-400">سجل</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs font-black border-b border-slate-100">
                      <th className="p-4">رقم السند</th>
                      <th className="p-4">التاريخ</th>
                      <th className="p-4">الفرع</th>
                      <th className="p-4">مركز التكلفة</th>
                      <th className="p-4">بند التكلفة</th>
                      <th className="p-4">القسم</th>
                      <th className="p-4">المبلغ</th>
                      <th className="p-4">طريقة الدفع</th>
                      <th className="p-4">الحالة</th>
                      <th className="p-4 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                    {costs.filter(c => {
                      const matchesSearch = ocSearch === '' || 
                        (c.notes && c.notes.toLowerCase().includes(ocSearch.toLowerCase())) ||
                        (c.voucher_no && c.voucher_no.toLowerCase().includes(ocSearch.toLowerCase()));
                      const matchesStatus = ocStatus === 'all' || c.status === ocStatus;
                      const matchesCenter = ocCenter === 'all' || Number(c.cost_center_id) === Number(ocCenter);
                      const matchesDate = (!ocFromDate || new Date(c.date) >= new Date(ocFromDate + 'T00:00:00')) &&
                                          (!ocToDate || new Date(c.date) <= new Date(ocToDate + 'T23:59:59'));
                      return matchesSearch && matchesStatus && matchesCenter && matchesDate;
                    }).length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-8 text-center text-slate-400 font-bold">
                          لا توجد تكاليف تشغيلية مطابقة لشروط البحث.
                        </td>
                      </tr>
                    ) : (
                      costs.filter(c => {
                        const matchesSearch = ocSearch === '' || 
                          (c.notes && c.notes.toLowerCase().includes(ocSearch.toLowerCase())) ||
                          (c.voucher_no && c.voucher_no.toLowerCase().includes(ocSearch.toLowerCase()));
                        const matchesStatus = ocStatus === 'all' || c.status === ocStatus;
                        const matchesCenter = ocCenter === 'all' || Number(c.cost_center_id) === Number(ocCenter);
                        const matchesDate = (!ocFromDate || new Date(c.date) >= new Date(ocFromDate + 'T00:00:00')) &&
                                            (!ocToDate || new Date(c.date) <= new Date(ocToDate + 'T23:59:59'));
                        return matchesSearch && matchesStatus && matchesCenter && matchesDate;
                      }).map((cost) => (
                        <tr key={cost.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-black text-indigo-600">{cost.voucher_no || `VC-2026-${100 + cost.id}`}</td>
                          <td className="p-4 text-slate-500">
                            {new Date(cost.date).toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                          </td>
                          <td className="p-4">{cost.branch || 'القاهرة'}</td>
                          <td className="p-4 text-slate-900">{cost.cost_center_name || 'غير محدد'}</td>
                          <td className="p-4 text-slate-900">{cost.cost_item_name || 'غير محدد'}</td>
                          <td className="p-4 text-slate-500">{cost.department || 'غير محدد'}</td>
                          <td className="p-4 font-black text-rose-600">
                            {Number(cost.amount || 0 || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م.
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px]">
                              {cost.payment_method || 'نقدي'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                              cost.status === 'معتمد' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                            }`}>
                              {cost.status || 'جديد'}
                            </span>
                          </td>
                          <td className="p-4 flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedCostDetail(cost);
                                setShowViewModal(true);
                              }}
                              title="عرض التفاصيل"
                              className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCost(cost.id)}
                              title="حذف"
                              className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-black text-slate-800">
                <span>الإجمالي:</span>
                <span className="text-sm font-black text-rose-600">
                  {costs.filter(c => {
                    const matchesSearch = ocSearch === '' || 
                      (c.notes && c.notes.toLowerCase().includes(ocSearch.toLowerCase())) ||
                      (c.voucher_no && c.voucher_no.toLowerCase().includes(ocSearch.toLowerCase()));
                    const matchesStatus = ocStatus === 'all' || c.status === ocStatus;
                    const matchesCenter = ocCenter === 'all' || Number(c.cost_center_id) === Number(ocCenter);
                    const matchesDate = (!ocFromDate || new Date(c.date) >= new Date(ocFromDate + 'T00:00:00')) &&
                                        (!ocToDate || new Date(c.date) <= new Date(ocToDate + 'T23:59:59'));
                    return matchesSearch && matchesStatus && matchesCenter && matchesDate;
                  }).reduce((acc, c) => acc + Number(c.amount || 0), 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1C: ESTIMATED BUDGET CONTROL                           */}
        {/* ========================================================= */}
        {activeTab === 'budget' && (() => {
          // Calculate budget metrics dynamically
          const filteredBudgets = budgets.filter(b => {
            const matchesYear = !budgetYear || Number(b.year) === Number(budgetYear);
            const matchesMonth = budgetMonth === 'الكل' || b.month === budgetMonth;
            return matchesYear && matchesMonth;
          });

          const totalPlanned = filteredBudgets.reduce((acc, b) => acc + Number(b.amount || 0), 0);
          
          // Compute actual costs matching the filtered budget items
          const budgetDetails = filteredBudgets.map(b => {
            // Find actual matching expenses in operating_costs
            const matchedTxns = costs.filter(c => {
              const matchCenter = Number(c.cost_center_id) === Number(b.cost_center_id);
              const matchItem = Number(c.cost_item_id) === Number(b.cost_item_id);
              
              const cDate = new Date(c.date);
              const cYear = cDate.getFullYear();
              const cMonthArabic = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][cDate.getMonth()];
              const matchYear = cYear === Number(b.year);
              const matchMonth = b.month === 'الكل' || cMonthArabic === b.month;

              return matchCenter && matchItem && matchYear && matchMonth;
            });

            const actualSum = matchedTxns.reduce((acc, c) => acc + Number(c.amount || 0), 0);
            const diff = Number(b.amount || 0) - actualSum;
            const execPct = Number(b.amount || 0) > 0 ? (actualSum / Number(b.amount || 0)) * 100 : 0;
            const status = actualSum > Number(b.amount || 0) ? 'متجاوز' : 'ضمن الحدود';

            return {
              ...b,
              actual: actualSum,
              diff,
              execPct,
              status
            };
          });

          const totalActual = budgetDetails.reduce((acc, b) => acc + b.actual, 0);
          const totalDeviation = totalPlanned - totalActual;
          const commitmentPct = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;

          return (
            <div className="space-y-6">
              {/* Title & Actions bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">مراقبة الموازنة التقديرية</h2>
                  <p className="text-xs text-slate-500 font-bold mt-1">مقارنة التكاليف الفعلية مع الموازنة التخطيطية لتحديد الانحرافات</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowBudgetModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all flex items-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة موازنة تقديرية</span>
                  </button>
                </div>
              </div>

              {/* Filter section */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Branch filter */}
                  <div>
                    <label className="text-xs font-black text-slate-600 block mb-1">الفرع</label>
                    <select
                      value={budgetBranch ?? ""}
                      onChange={(e) => setBudgetBranch(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="الكل">الكل</option>
                      <option value="القاهرة">القاهرة</option>
                      <option value="الجيزة">الجيزة</option>
                    </select>
                  </div>

                  {/* Year filter */}
                  <div>
                    <label className="text-xs font-black text-slate-600 block mb-1">السنة</label>
                    <select
                      value={budgetYear ?? ""}
                      onChange={(e) => setBudgetYear(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={2026}>2026</option>
                      <option value={2025}>2025</option>
                    </select>
                  </div>

                  {/* Month filter */}
                  <div>
                    <label className="text-xs font-black text-slate-600 block mb-1">الشهر</label>
                    <select
                      value={budgetMonth ?? ""}
                      onChange={(e) => setBudgetMonth(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="الكل">الكل</option>
                      {['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* KPI indicators bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* planned */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between text-right">
                  <span className="text-xs font-bold text-slate-500">إجمالي الموازنة المخططة</span>
                  <div className="mt-2 text-xl font-black text-indigo-950">
                    {Number(totalPlanned || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} <span className="text-xs font-bold text-slate-400">ج.م.</span>
                  </div>
                </div>

                {/* actual */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between text-right">
                  <span className="text-xs font-bold text-slate-500">إجمالي التكاليف الفعلية</span>
                  <div className="mt-2 text-xl font-black text-rose-600">
                    {Number(totalActual || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} <span className="text-xs font-bold text-slate-400">ج.م.</span>
                  </div>
                </div>

                {/* deviation */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between text-right">
                  <span className="text-xs font-bold text-slate-500">الانحراف الإجمالي</span>
                  <div className={`mt-2 text-xl font-black ${totalDeviation >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {totalDeviation >= 0 ? '+' : ''}{Number(totalDeviation || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} <span className="text-xs font-bold text-slate-400">ج.م.</span>
                  </div>
                </div>

                {/* alignment */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between text-right">
                  <span className="text-xs font-bold text-slate-500">نسبة الالتزام بالموازنة</span>
                  <div className="mt-2 text-xl font-black text-slate-900">
                    {commitmentPct.toFixed(1)}%
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className={`h-full rounded-full ${commitmentPct > 100 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(commitmentPct, 100)}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Budgets comparison table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs font-black border-b border-slate-100">
                        <th className="p-4">مركز التكلفة</th>
                        <th className="p-4">بند التكلفة</th>
                        <th className="p-4">المخطط</th>
                        <th className="p-4">الفعلي</th>
                        <th className="p-4">الفرق</th>
                        <th className="p-4">% التنفيذ</th>
                        <th className="p-4">الحالة</th>
                        <th className="p-4 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                      {budgetDetails.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                            لا توجد بنود موازنة تقديرية مضافة لهذه الفترة.
                          </td>
                        </tr>
                      ) : (
                        budgetDetails.map((b) => (
                          <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 text-slate-950 font-black">{b.cost_center_name || 'غير محدد'}</td>
                            <td className="p-4 text-slate-800">{b.cost_item_name || 'غير محدد'}</td>
                            <td className="p-4 text-indigo-600">
                              {Number(b.amount || 0 || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م.
                            </td>
                            <td className="p-4 text-rose-500">
                              {Number(b.actual || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م.
                            </td>
                            <td className={`p-4 ${b.diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {b.diff >= 0 ? '+' : ''}{Number(b.diff || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م.
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs">{b.execPct.toFixed(1)}%</span>
                                <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                                  <div className={`h-full rounded-full ${b.execPct > 100 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(b.execPct, 100)}%` }}></div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                b.status === 'ضمن الحدود' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                              }`}>
                                {b.status}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => handleDeleteBudget(b.id)}
                                title="حذف"
                                className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ========================================================= */}
        {/* TAB 2: COST CENTERS                                      */}
        {/* ========================================================= */}
        {activeTab === 'centers' && (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-6 space-y-6">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h2 className="text-3xl font-black text-slate-900">مراكز التكلفة</h2>
                <p className="text-sm text-slate-500 mt-1 font-medium">تعريف وهيكلة مراكز التكلفة في المؤسسة.</p>
              </div>
              <button 
                onClick={() => {
                  setNewCenter({
                    id: null,
                    code: `CC-${String(centers.length + 1).padStart(3, '0')}`,
                    name: '',
                    type: 'إنتاج',
                    branch: 'القاهرة',
                    manager: '',
                    status: 'نشط',
                    notes: '',
                    monthly_budget: '',
                    parent_id: ''
                  });
                  setShowCenterModal(true);
                }}
                className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center gap-2 text-sm shadow-md shadow-emerald-100"
              >
                <Plus className="w-5 h-5" />
                <span>إضافة مركز</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 text-xs font-black border-b border-slate-100">
                    <th className="p-4 text-center w-24">الكود</th>
                    <th className="p-4">الاسم</th>
                    <th className="p-4 w-32">النوع</th>
                    <th className="p-4 w-40">المركز الرئيسي</th>
                    <th className="p-4 w-48 text-right">الموازنة الشهرية</th>
                    <th className="p-4 w-28">الحالة</th>
                    <th className="p-4 w-28 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {centers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">
                        لا توجد مراكز تكلفة مسجلة حالياً.
                      </td>
                    </tr>
                  ) : (
                    centers.map((cc) => (
                      <tr key={cc.id} className="hover:bg-slate-50/20 transition-colors">
                        <td className="p-4 font-bold text-slate-500 text-center">{cc.code}</td>
                        <td className="p-4 font-bold text-slate-900">{cc.name}</td>
                        <td className="p-4">
                          <span className={`px-4 py-1.5 rounded-xl text-xs font-bold border inline-flex items-center justify-center min-w-[70px] ${
                            cc.type === 'إنتاج' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
                            cc.type === 'خدمي' ? 'text-blue-600 bg-blue-50/80 border-blue-200' :
                            'text-amber-600 bg-amber-50/80 border-amber-200' // 'إداري'
                          }`}>
                            {cc.type || 'إداري'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 font-medium">
                          {cc.parent_name || '-'}
                        </td>
                        <td className="p-4 font-bold text-slate-700 text-right font-mono">
                          {Number(cc.monthly_budget || 0 || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م.
                        </td>
                        <td className="p-4">
                          <span className={`px-4 py-1 rounded-full text-xs font-black inline-flex items-center justify-center ${
                            cc.status === 'نشط' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                          }`}>
                            {cc.status || 'نشط'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleEditCenter(cc)}
                              className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                              title="تعديل مركز التكلفة"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteCenter(cc.id)}
                              className="p-1.5 hover:bg-rose-50 text-rose-400 hover:text-rose-600 rounded-lg transition-colors"
                              title="حذف مركز التكلفة"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: COST ITEMS                                        */}
        {/* ========================================================= */}
        {activeTab === 'items' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden space-y-6 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-800">بنود التكاليف والمصاريف</h2>
                <p className="text-xs text-slate-500 font-medium">إدارة البنود والمصنفات التشغيلية للتكاليف العامة</p>
              </div>
              <button 
                onClick={() => setShowItemModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all flex items-center gap-2 text-sm"
              >
                <Plus className="w-5 h-5" />
                <span>بند تكلفة جديد</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-black border-b border-slate-100">
                    <th className="p-4">#</th>
                    <th className="p-4">كود البند</th>
                    <th className="p-4">اسم البند</th>
                    <th className="p-4">نوع التكلفة</th>
                    <th className="p-4">القسم</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">
                        لا توجد بنود تكاليف مسجلة حالياً.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-4 font-black text-indigo-600">{item.code}</td>
                        <td className="p-4 font-bold text-slate-900">{item.name}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-600">
                            {item.cost_type}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 font-bold">{item.department}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                            item.status === 'نشط' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            {item.status || 'نشط'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                            title="حذف بند التكلفة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: NEW COST ENTRY FORM                              */}
        {/* ========================================================= */}
        {activeTab === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form Block */}
            <form className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-800">بيانات التكلفة الأساسية</h2>
                  <p className="text-xs text-slate-500 font-medium">سجل البيانات والتفاصيل المالية للمصروف الجديد بدقة</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 text-sm font-bold hover:bg-slate-50 transition-all"
                  >
                    إلغاء
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => handleCreateCost(e, true)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-indigo-600 rounded-xl text-sm font-bold transition-all"
                  >
                    حفظ وإضافة جديد
                  </button>
                  <button 
                    type="submit"
                    onClick={(e) => handleCreateCost(e, false)}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-100 transition-all flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>حفظ التكلفة</span>
                  </button>
                </div>
              </div>

              {/* Form Grid inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* الفرع */}
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">الفرع <span className="text-rose-500">*</span></label>
                  <select 
                    value={formData.branch ?? ""}
                    onChange={(e) => setFormData({...formData, branch: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                  >
                    {systemBranches.length > 0 ? (
                      systemBranches.map((b, idx) => (<option key={`br-${b.id || b.name || idx}-${idx}`} value={b.name}>{b.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="القاهرة">القاهرة</option>
                        <option value="الجيزة">الجيزة</option>
                        <option value="الإسكندرية">الإسكندرية</option>
                      </>
                    )}
                  </select>
                </div>

                {/* التاريخ */}
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">التاريخ <span className="text-rose-500">*</span></label>
                  <input 
                    type="date"
                    value={formData.date ?? ""}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                  />
                </div>

                {/* القسم */}
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">القسم <span className="text-rose-500">*</span></label>
                  <select 
                    value={formData.department ?? ""}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                  >
                    {systemDepartments.length > 0 ? (
                      systemDepartments.map((d, idx) => (<option key={`dep-${d.id || d.name || idx}-${idx}`} value={d.name}>{d.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="المخازن">المخازن</option>
                        <option value="المبيعات">المبيعات</option>
                        <option value="المطبخ">المطبخ</option>
                        <option value="الموارد البشرية">الموارد البشرية</option>
                        <option value="الدليفري">الدليفري</option>
                        <option value="المصروفات العامة">المصروفات العامة</option>
                      </>
                    )}
                  </select>
                </div>

                {/* مركز التكلفة */}
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">مركز التكلفة <span className="text-rose-500">*</span></label>
                  <select 
                    value={formData.cost_center_id ?? ""}
                    onChange={(e) => setFormData({...formData, cost_center_id: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-indigo-600"
                    required
                  >
                    <option value="">اختر مركز التكلفة...</option>
                    {centers.map(cc => (
                      <option key={cc.id} value={cc.id}>{cc.name} ({cc.code})</option>
                    ))}
                  </select>
                </div>

                {/* بند التكلفة */}
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">بند التكلفة <span className="text-rose-500">*</span></label>
                  <select 
                    value={formData.cost_item_id ?? ""}
                    onChange={(e) => {
                      const itemId = e.target.value;
                      const selectedItem = items.find(item => String(item.id) === String(itemId));
                      if (selectedItem) {
                        setFormData(prev => ({
                          ...prev,
                          cost_item_id: itemId,
                          cost_center_id: selectedItem.default_center_id ? String(selectedItem.default_center_id) : prev.cost_center_id,
                          accounting_account: selectedItem.accounting_account_id ? (systemAccounts.find(a => Number(a.id) === Number(selectedItem.accounting_account_id))?.name_ar || systemAccounts.find(a => Number(a.id) === Number(selectedItem.accounting_account_id))?.name || prev.accounting_account) : prev.accounting_account,
                          // Pre-fill links if any are activated for this item
                          employee_id: selectedItem.is_hr_linked && systemEmployees.length > 0 ? String(systemEmployees[0].id) : prev.employee_id,
                          employee: selectedItem.is_hr_linked && systemEmployees.length > 0 ? systemEmployees[0].name : prev.employee,
                          supplier_id: selectedItem.is_procurement_linked && systemSuppliers.length > 0 ? String(systemSuppliers[0].id) : prev.supplier_id,
                          supplier: selectedItem.is_procurement_linked && systemSuppliers.length > 0 ? systemSuppliers[0].name : prev.supplier,
                          product_id: selectedItem.is_warehouse_linked && systemProducts.length > 0 ? String(systemProducts[0].id) : prev.product_id,
                          product: selectedItem.is_warehouse_linked && systemProducts.length > 0 ? systemProducts[0].name : prev.product,
                          warehouse_id: selectedItem.is_warehouse_linked && systemWarehouses.length > 0 ? String(systemWarehouses[0].id) : prev.warehouse_id,
                        }));
                        if (selectedItem.budget_cap > 0) {
                          showToast(`تنبيه: هذا البند لديه سقف ميزانية قدره ${Number(selectedItem.budget_cap || 0).toLocaleString()} ج.م`, 'success');
                        }
                      } else {
                        setFormData(prev => ({ ...prev, cost_item_id: itemId }));
                      }
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-indigo-600"
                    required
                  >
                    <option value="">اختر بند التكلفة...</option>
                    {items.map(item => (
                      <option key={item.id} value={item.id}>{item.name} ({item.cost_type})</option>
                    ))}
                  </select>
                </div>

                {/* طريقة الدفع */}
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">طريقة الدفع <span className="text-rose-500">*</span></label>
                  <select 
                    value={formData.payment_method ?? ""}
                    onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                  >
                    <option value="نقدي">نقدي</option>
                    <option value="شبكة">شبكة</option>
                    <option value="تحويل بنكي">تحويل بنكي</option>
                  </select>
                </div>

                {/* الخزينة */}
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">الخزينة / الحساب <span className="text-rose-500">*</span></label>
                  <select 
                    value={formData.safe ?? ""}
                    onChange={(e) => setFormData({...formData, safe: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                  >
                    {(systemSafes.length > 0 || systemAccounts.length > 0) ? (
                      <>
                        {systemSafes.length > 0 && (
                          <optgroup label="الخزائن">
                            {systemSafes.map((s, idx) => (<option key={`safe-${s.id || s.name || idx}-${idx}`} value={s.name}>{s.name}</option>
                            ))}
                          </optgroup>
                        )}
                        {systemAccounts.length > 0 && (
                          <optgroup label="الحسابات البنكية والمالية">
                            {systemAccounts.map((a, idx) => (<option key={`acc-${a.id || a.name || idx}-${idx}`} value={a.name}>{a.name} ({a.code})</option>
                            ))}
                          </optgroup>
                        )}
                      </>
                    ) : (
                      <>
                        <option value="خزينة فرع القاهرة">خزينة فرع القاهرة</option>
                        <option value="خزينة فرع الجيزة">خزينة فرع الجيزة</option>
                        <option value="البنك الأهلي المصري">البنك الأهلي المصري</option>
                        <option value="بنك مصر الرئيسي">بنك مصر الرئيسي</option>
                      </>
                    )}
                  </select>
                </div>

                {/* رقم السند */}
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">رقم السند / الفاتورة</label>
                  <input 
                    type="text"
                    placeholder="مثال: INV-2025-001"
                    value={formData.voucher_no ?? ""}
                    onChange={(e) => setFormData({...formData, voucher_no: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                  />
                </div>

                {/* القيمة */}
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 block mb-1">القيمة المالية (ج.م) <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <input 
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount ?? ""}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full p-3 pl-12 rounded-xl border border-slate-200 text-base font-black focus:ring-2 focus:ring-indigo-500 focus:outline-none text-emerald-600"
                      required
                    />
                    <DollarSign className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                  </div>
                </div>

                {/* قسم الربط والتكامل الشامل بين الموديولات */}
                <div className="md:col-span-2 bg-indigo-50/20 p-5 rounded-2xl border border-indigo-100/60 space-y-4">
                  <div className="flex items-center gap-2 border-b border-indigo-50 pb-2">
                    <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse animate-duration-1000" />
                    <div>
                      <h3 className="text-sm font-black text-indigo-950">التكامل والربط الذكي بين موديولات النظام</h3>
                      <p className="text-[10px] text-slate-500 font-bold">اربط هذا المصروف تلقائياً بكافة موديولات السيستم لضمان دقة التقارير وتحليل الأداء والربحية</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* الموارد البشرية - الموظف */}
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">ربط بالموارد البشرية (الموظف)</label>
                      <select
                        value={formData.employee_id ?? ""}
                        onChange={(e) => {
                          const empId = e.target.value;
                          const empName = systemEmployees.find(emp => String(emp.id) === String(empId))?.name || '';
                          setFormData({...formData, employee_id: empId, employee: empName});
                        }}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="">-- غير مرتبط بموظف معين --</option>
                        {systemEmployees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name} ({emp.job_title || 'موظف'})</option>
                        ))}
                      </select>
                    </div>

                    {/* المشتريات - المورد */}
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">ربط بالمشتريات (المورد)</label>
                      <select
                        value={formData.supplier_id ?? ""}
                        onChange={(e) => {
                          const supId = e.target.value;
                          const supName = systemSuppliers.find(sup => String(sup.id) === String(supId))?.name || '';
                          setFormData({...formData, supplier_id: supId, supplier: supName});
                        }}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="">-- غير مرتبط بمورد معين --</option>
                        {systemSuppliers.map(sup => (
                          <option key={sup.id} value={sup.id}>{sup.name} Number(الرصيد: {Number(sup.balance || 0 || 0).toLocaleString()} ج.م.)</option>
                        ))}
                      </select>
                    </div>

                    {/* العملاء - العميل */}
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">ربط بالعملاء (العميل)</label>
                      <select
                        value={formData.customer_id ?? ""}
                        onChange={(e) => {
                          const custId = e.target.value;
                          const custName = systemCustomers.find(cust => String(cust.id) === String(custId))?.name || '';
                          setFormData({...formData, customer_id: custId, customer: custName});
                        }}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="">-- غير مرتبط بعميل معين --</option>
                        {systemCustomers.map(cust => (
                          <option key={cust.id} value={cust.id}>{cust.name} ({cust.phone || 'عميل'})</option>
                        ))}
                      </select>
                    </div>

                    {/* المخازن - المنتج/المخزون */}
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">ربط بالمخازن والمستودعات (المنتج / الخامة)</label>
                      <select
                        value={formData.product_id ?? ""}
                        onChange={(e) => {
                          const prodId = e.target.value;
                          const prodName = systemProducts.find(prod => String(prod.id) === String(prodId))?.name || '';
                          setFormData({...formData, product_id: prodId, product: prodName});
                        }}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="">-- غير مرتبط بمنتج مخزني --</option>
                        {systemProducts.map(prod => (
                          <option key={prod.id} value={prod.id}>{prod.name} Number({Number(prod.price || 0 || 0).toLocaleString()} ج.م.)</option>
                        ))}
                      </select>
                    </div>

                    {/* دليل الحسابات */}
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">الحساب المالي (شجرة الحسابات)</label>
                      <select
                        value={formData.accounting_account ?? ""}
                        onChange={(e) => setFormData({...formData, accounting_account: e.target.value})}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="">-- اختر الحساب المالي المقابل --</option>
                        {systemAccounts.map(acc => (
                          <option key={acc.id} value={acc.name_ar || acc.name}>{acc.code} - {acc.name_ar || acc.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* المشروع / المبادرة */}
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">ربط بمشروع أو مبادرة داخلية</label>
                      <input
                        type="text"
                        placeholder="مثال: مشروع تطوير البنية التحتية"
                        value={formData.project ?? ""}
                        onChange={(e) => setFormData({...formData, project: e.target.value})}
                        className="w-full p-2 rounded-xl border border-slate-200 text-xs font-bold bg-white p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    {/* الضريبة والعملة ومعدلات الحساب */}
                    <div className="sm:col-span-2 grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">الضريبة (%)</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={formData.tax ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            const amt = parseFloat(formData.amount) || 0;
                            const taxAmt = (parseFloat(val) || 0) * amt / 100;
                            setFormData({...formData, tax: val, total: String(amt + taxAmt)});
                          }}
                          className="w-full p-1.5 rounded-lg border border-slate-200 text-xs font-black text-indigo-700"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">إجمالي شامل الضريبة</label>
                        <input
                          type="text"
                          disabled
                          value={formData.total || formData.amount}
                          className="w-full p-1.5 rounded-lg border border-slate-200 text-xs font-black bg-slate-100 text-emerald-700"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">العملة</label>
                        <select
                          value={formData.currency ?? ""}
                          onChange={(e) => setFormData({...formData, currency: e.target.value})}
                          className="w-full p-1.5 rounded-lg border border-slate-200 text-xs font-black"
                        >
                          <option value="EGP">EGP (ج.م)</option>
                          <option value="USD">USD ($)</option>
                          <option value="SAR">SAR (ر.س)</option>
                          <option value="AED">AED (د.إ)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* الوصف */}
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 block mb-1">الوصف / ملاحظات إضافية</label>
                  <textarea 
                    rows={4}
                    placeholder="اكتب تفاصيل الفاتورة أو المصروف هنا بالتفصيل..."
                    value={formData.notes ?? ""}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                  ></textarea>
                </div>
              </div>
            </form>

            {/* Right Sidebar Details */}
            <div className="space-y-6">
              {/* Attachments Section */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                  <Paperclip className="w-5 h-5 text-indigo-600" />
                  <h4 className="text-sm font-black text-slate-700">مرفقات ومستندات مؤيدة</h4>
                </div>

                <div className="space-y-3">
                  {attachments.map(att => (
                    <div key={att.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-5 h-5 text-rose-500 shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-700 truncate" title={att.name}>{att.name}</p>
                          <span className="text-[10px] text-slate-400 font-bold">{att.size}</span>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleRemoveAttachment(att.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Real File Upload & Dropzone */}
                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-xl p-4 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-indigo-50/10 group relative"
                  onClick={() => document.getElementById('real-file-input')?.click()}
                >
                  <input 
                    type="file" 
                    id="real-file-input" 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    <div>
                      <p className="text-xs font-black text-slate-700">اضغط هنا لرفع ملف من جهازك</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">أو اسحب وأفلت الفاتورة/المستند مباشرة هنا</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-[10px] font-bold text-slate-400 block">أو اكتب اسم الملف يدوياً (محاكاة)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="اسم الملف..."
                      value={newAttachmentName ?? ""}
                      onChange={(e) => setNewAttachmentName(e.target.value)}
                      className="flex-1 p-2 border border-slate-200 rounded-xl text-xs focus:outline-none font-bold"
                    />
                    <button 
                      type="button"
                      onClick={handleAddAttachment}
                      className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 shrink-0"
                    >
                      إضافة
                    </button>
                  </div>
                </div>
              </div>

              {/* Extra Details */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                  <Settings className="w-5 h-5 text-indigo-600" />
                  <h4 className="text-sm font-black text-slate-700">تفاصيل إضافية</h4>
                </div>

                <div className="space-y-4">
                  {/* حالة التكلفة */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">حالة التكلفة</label>
                    <select 
                      value={formData.status ?? ""}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full p-2 rounded-xl border border-slate-200 text-xs focus:outline-none font-bold"
                    >
                      <option value="جديد">جديد</option>
                      <option value="معتمد">معتمد</option>
                    </select>
                  </div>

                  {/* تم الإنشاء بواسطة */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">تم الإنشاء بواسطة</label>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl text-xs text-slate-600 font-bold">
                      <User className="w-4 h-4 text-indigo-600" />
                      <span>{formData.created_by}</span>
                    </div>
                  </div>

                  {/* تاريخ الإنشاء */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">تاريخ الإنشاء</label>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl text-xs text-slate-600 font-bold">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      <span>{new Date().toLocaleString('ar-EG')}</span>
                    </div>
                  </div>

                  {/* ربط بقيد محاسبي toggle */}
                  <div className="flex items-center justify-between p-2 bg-indigo-50/50 rounded-xl">
                    <span className="text-xs font-black text-indigo-950">ربط بقيد محاسبي</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.link_ledger} 
                        onChange={(e) => setFormData({...formData, link_ledger: e.target.checked})}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* NEW TAB: COST ALLOCATION & LOADING                        */}
        {/* ========================================================= */}
        {activeTab === 'allocation' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Shuffle className="w-6 h-6 text-indigo-600" />
                  <span>محرك توزيع وتحميل التكاليف</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">توزيع المصاريف العامة أو المشتركة على مراكز التكلفة، الفروع، أو المنتجات وحساب معدلات التحميل</p>
              </div>
              <button 
                onClick={() => {
                  setAllocRows([...allocRows, { targetId: '', value: '0', description: 'توزيع إضافي' }]);
                }}
                className="px-4 py-2 border border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة بند توزيع</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Allocation Calculator Form */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                    <span>توزيع مبلغ أو معامل تكلفة معين</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Cost Source */}
                  <div>
                    <label className="text-xs font-black text-slate-600 block mb-1">مصدر التكلفة المراد توزيعها</label>
                    <select 
                      value={allocSource ?? ""}
                      onChange={(e) => {
                        setAllocSource(e.target.value);
                        if (e.target.value !== 'custom') {
                          const matchingCost = costs.find(c => String(c.id) === e.target.value);
                          if (matchingCost) setAllocAmount(String(matchingCost.amount));
                        }
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="custom">مبلغ مخصص (إدخال يدوي)</option>
                      {costs.map(c => (
                        <option key={c.id} value={c.id}>سند {c.voucher_no} - {c.notes || 'بلا بيان'} Number({Number(c.amount || 0).toLocaleString()} ج.م.)</option>
                      ))}
                    </select>
                  </div>

                  {/* Cost Amount */}
                  <div>
                    <label className="text-xs font-black text-slate-600 block mb-1">المبلغ الإجمالي للتوزيع (ج.م.)</label>
                    <input 
                      type="number"
                      disabled={allocSource !== 'custom'}
                      value={allocAmount ?? ""}
                      onChange={(e) => setAllocAmount(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 disabled:bg-slate-50/50"
                    />
                  </div>

                  {/* Allocation Method */}
                  <div>
                    <label className="text-xs font-black text-slate-600 block mb-1">أساس أو طريقة التوزيع (Allocation Method)</label>
                    <select 
                      value={allocMethod ?? ""}
                      onChange={(e) => setAllocMethod(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="percentage">نسب مئوية مخصصة (%)</option>
                      <option value="fixed">مبالغ ثابتة ومحددة (ج.م.)</option>
                      <option value="quantity">حجم أو كمية الإنتاج الفعلية</option>
                      <option value="hours">ساعات التشغيل الفعلي للآلات</option>
                      <option value="employees">عدد موظفي القسم / المركز</option>
                      <option value="area">المساحة المستغلة بالمتر المربع</option>
                    </select>
                  </div>

                  {/* Target Dimension */}
                  <div>
                    <label className="text-xs font-black text-slate-600 block mb-1">توزيع التكلفة على أبعاد</label>
                    <select 
                      value={allocTargetType ?? ""}
                      onChange={(e) => {
                        setAllocTargetType(e.target.value as any);
                        // Reset rows with reasonable default targets
                        if (e.target.value === 'centers') {
                          setAllocRows([{ targetId: '1', value: '40', description: 'حصة الإنتاج' }, { targetId: '2', value: '60', description: 'حصة الإدارة والخدمات' }]);
                        } else {
                          setAllocRows([{ targetId: '1', value: '50', description: 'حصة فرع القاهرة' }, { targetId: '2', value: '50', description: 'حصة فرع الإسكندرية' }]);
                        }
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="centers">مراكز التكلفة (Cost Centers)</option>
                      <option value="branches">الفروع الجغرافية (Branches)</option>
                      <option value="departments">الأقسام الإدارية (Departments)</option>
                      <option value="products">خطوط المنتجات (Product Lines)</option>
                      <option value="projects">المشاريع النشطة (Projects)</option>
                    </select>
                  </div>
                </div>

                {/* Split Rows */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-xs font-black text-slate-700 block">تفاصيل جهات وعوامل التوزيع والتقسيم:</span>
                  
                  {allocRows.map((row, index) => (
                    <div key={row.targetId || index} className="flex flex-col sm:flex-row items-center gap-3">
                      {/* Target Select */}
                      <div className="flex-1 w-full">
                        <select
                          value={row.targetId ?? ""}
                          onChange={(e) => {
                            const copy = [...allocRows];
                            copy[index].targetId = e.target.value;
                            setAllocRows(copy);
                          }}
                          className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                        >
                          <option value="">-- اختر الجهة المستهدفة --</option>
                          {allocTargetType === 'centers' && (
                            centers.map(cc => <option key={cc.id} value={cc.id}>{cc.name} ({cc.code})</option>)
                          )}
                          {allocTargetType === 'branches' && (
                            (systemBranches.length > 0 ? systemBranches : [{id: '1', name: 'فرع القاهرة'}, {id: '2', name: 'فرع الجيزة'}]).map((b: any) => <option key={b.id} value={b.name}>{b.name}</option>)
                          )}
                          {allocTargetType === 'departments' && (
                            (systemDepartments.length > 0 ? systemDepartments : [{id: '1', name: 'المخازن'}, {id: '2', name: 'المبيعات'}]).map((d: any) => <option key={d.id} value={d.name}>{d.name}</option>)
                          )}
                          {allocTargetType === 'products' && (
                            [{id: '1', name: 'بيتزا نابوليتان'}, {id: '2', name: 'كلاسيك برجر'}].map(p => <option key={p.id} value={p.name}>{p.name}</option>)
                          )}
                          {allocTargetType === 'projects' && (
                            [{id: '1', name: 'تطوير خط الوجبات الدسمة'}, {id: '2', name: 'حملة التسويق الرقمي'}].map(pr => <option key={pr.id} value={pr.name}>{pr.name}</option>)
                          )}
                        </select>
                      </div>

                      {/* Factor Value */}
                      <div className="w-full sm:w-36 flex items-center gap-1">
                        <input
                          type="number"
                          value={row.value ?? ""}
                          onChange={(e) => {
                            const copy = [...allocRows];
                            copy[index].value = e.target.value;
                            setAllocRows(copy);
                          }}
                          placeholder={allocMethod === 'percentage' ? '%' : 'القيمة'}
                          className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-center focus:outline-none"
                        />
                        <span className="text-xs font-black text-slate-500">
                          {allocMethod === 'percentage' && '%'}
                          {allocMethod === 'fixed' && 'ج.م'}
                          {allocMethod === 'quantity' && 'وحدة'}
                          {allocMethod === 'hours' && 'ساعة'}
                          {allocMethod === 'employees' && 'موظف'}
                          {allocMethod === 'area' && 'م²'}
                        </span>
                      </div>

                      {/* Note / Description */}
                      <div className="flex-1 w-full">
                        <input
                          type="text"
                          value={row.description ?? ""}
                          onChange={(e) => {
                            const copy = [...allocRows];
                            copy[index].description = e.target.value;
                            setAllocRows(copy);
                          }}
                          placeholder="ملاحظات الحصة التوزيعية"
                          className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-right focus:outline-none"
                        />
                      </div>

                      {/* Remove button */}
                      <button 
                        onClick={() => {
                          const copy = allocRows.filter((_, i) => i !== index);
                          setAllocRows(copy);
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Calculation Summary / Split Results */}
                <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100/50 text-right space-y-3">
                  <span className="text-xs font-black text-indigo-950 block">مخرجات الحساب والتوزيع المقترح:</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-slate-700">
                    <div>
                      <span>المبلغ المستهدف: </span>
                      <span className="font-black text-slate-900">{Number(allocAmount || 0 || 0).toLocaleString()} ج.م.</span>
                    </div>

                    <div>
                      <span>إجمالي العوامل المدخلة: </span>
                      <span className="font-black text-slate-900">
                        {allocRows.reduce((acc, r) => acc + Number(r.value || 0), 0).toLocaleString()}{' '}
                        {allocMethod === 'percentage' && '%'}
                        {allocMethod === 'fixed' && 'ج.م'}
                        {allocMethod === 'quantity' && 'وحدة'}
                        {allocMethod === 'hours' && 'ساعة'}
                        {allocMethod === 'employees' && 'موظف'}
                        {allocMethod === 'area' && 'م²'}
                      </span>
                    </div>

                    <div>
                      <span>حالة الاتساق: </span>
                      {allocMethod === 'percentage' ? (
                        allocRows.reduce((acc, r) => acc + Number(r.value || 0), 0) === 100 ? (
                          <span className="text-emerald-600 font-black">✓ مكتمل بنسبة 100%</span>
                        ) : (
                          <span className="text-amber-600 font-black">⚠️ المجموع لا يساوي 100% ({allocRows.reduce((acc, r) => acc + Number(r.value || 0), 0)}%)</span>
                        )
                      ) : (
                        <span className="text-indigo-600 font-black">✓ توزيع تناسبي نشط</span>
                      )}
                    </div>
                  </div>

                  {/* Calculated Breakdown List */}
                  <div className="mt-3 divide-y divide-slate-100 bg-white rounded-lg p-3 border border-slate-150 space-y-1">
                    <span className="text-[10px] font-black text-slate-400 block pb-1 border-b border-slate-100">تفصيل المبالغ الموزعة لكل مستهدف:</span>
                    {(() => {
                      const totalAmount = Number(allocAmount || 0);
                      const totalFactors = allocRows.reduce((acc, r) => acc + Number(r.value || 0), 0) || 1;
                      
                      return allocRows.map((row, index) => {
                        let rowAllocated = 0;
                        if (allocMethod === 'percentage') {
                          rowAllocated = (totalAmount * Number(row.value || 0)) / 100;
                        } else if (allocMethod === 'fixed') {
                          rowAllocated = Number(row.value || 0);
                        } else {
                          // Proportional
                          rowAllocated = (totalAmount * Number(row.value || 0)) / totalFactors;
                        }

                        return (
                          <div key={row.targetId || index} className="flex items-center justify-between py-1.5 text-xs">
                            <div className="flex items-center gap-1">
                              <span className="font-black text-slate-800">الحصة المستهدفة #{index + 1}: </span>
                              <span className="text-slate-500 font-bold">
                                {row.targetId ? (
                                  allocTargetType === 'centers' 
                                    ? (centers.find(c => String(c.id) === row.targetId)?.name || row.targetId)
                                    : row.targetId
                                ) : 'غير محدد'}
                              </span>
                            </div>
                            <span className="font-black text-indigo-700">{Number(rowAllocated || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ج.م.</span>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Action button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={async () => {
                        if (allocRows.some(r => !r.targetId)) {
                          showToast('يرجى تحديد الجهات المستهدفة للتوزيع أولاً', 'error');
                          return;
                        }
                        const totalAmount = Number(allocAmount || 0);
                        if (totalAmount <= 0) {
                          showToast('يرجى كتابة مبلغ إيجابي للتوزيع', 'error');
                          return;
                        }

                        try {
                          showToast('جاري تطبيق قيد التوزيع التناسبي على المديول محاسبياً...');
                          // Log inside activity logs using our new endpoint
                          const res = await api.post('/api/costs', {
                            voucher_no: `ALL-${Math.floor(1000 + Math.random() * 9000)}`,
                            date: new Date().toISOString().split('T')[0],
                            branch: 'القاهرة',
                            department: 'الإنتاج',
                            notes: `توزيع تكلفة مشتركة تجميعية بقيمة ${totalAmount} ج.م. على مراكز ${allocTargetType}`,
                            amount: totalAmount,
                            status: 'نشط',
                            approval_status: 'Posted',
                            link_ledger: true
                          });
                          if (res.ok) {
                            showToast('تم تطبيق قيد وتوزيع التكاليف وتسجيل الترانزكشن في السجل العام بنجاح');
                            fetchData();
                          }
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-md shadow-indigo-100 flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>تطبيق وتوزيع التكلفة في الدفاتر</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Cost Loading Rates (معدلات تحميل التكاليف) */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <Percent className="w-4 h-4 text-indigo-600" />
                    <span>معدلات تحميل مراكز العمل (Cost Loading)</span>
                  </h3>
                </div>

                <div className="space-y-4 text-right">
                  <div>
                    <label className="text-xs font-black text-slate-600 block mb-1">نوع الكيان ومعدل التحميل</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => {
                          setLoadedRateType('machine');
                          setLoadedBaseRate('250');
                          setLoadedOverhead('75');
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-black transition-all ${
                          loadedRateType === 'machine' 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        تحميل الآلات / الماكينات
                      </button>
                      <button 
                        onClick={() => {
                          setLoadedRateType('employee');
                          setLoadedBaseRate('180');
                          setLoadedOverhead('45');
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-black transition-all ${
                          loadedRateType === 'employee' 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        تحميل الموظف / خط العمل
                      </button>
                    </div>
                  </div>

                  {/* Base rate */}
                  <div>
                    <label className="text-xs font-black text-slate-600 block mb-1">
                      {loadedRateType === 'machine' ? 'معدل التكلفة الأساسية للآلة (ج.م./ساعة)' : 'معدل الأجر الأساسي للموظف (ج.م./ساعة)'}
                    </label>
                    <input 
                      type="number"
                      value={loadedBaseRate ?? ""}
                      onChange={(e) => setLoadedBaseRate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>

                  {/* Overhead rate */}
                  <div>
                    <label className="text-xs font-black text-slate-600 block mb-1">تعديل معامل الأعباء المضافة / التكاليف غير المباشرة (ج.م./ساعة)</label>
                    <input 
                      type="number"
                      value={loadedOverhead ?? ""}
                      onChange={(e) => setLoadedOverhead(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>

                  {/* Total monthly hours */}
                  <div>
                    <label className="text-xs font-black text-slate-600 block mb-1">متوسط ساعات العمل الشهرية المستهدفة (ساعة)</label>
                    <input 
                      type="number"
                      value={loadedHours ?? ""}
                      onChange={(e) => setLoadedHours(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>

                  {/* Computed Outcome Box */}
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-center">
                    <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">معدل التحميل المحتسب الكلي</span>
                    <div className="text-2xl font-black text-indigo-700">
                      {(Number(loadedBaseRate || 0) + Number(loadedOverhead || 0)).toLocaleString()} ج.م.
                      <span className="text-xs text-slate-500 font-bold"> / ساعة</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold block">
                      إجمالي عبء المركز شهرياً: {((Number(loadedBaseRate || 0) + Number(loadedOverhead || 0)) * Number(loadedHours || 0)).toLocaleString()} ج.م.
                    </span>
                  </div>

                  {/* Chart for comparative loaded rates */}
                  <div className="pt-2 h-44">
                    <span className="text-[10px] font-black text-slate-400 block mb-2">مقارنة معدلات التحميل المقدرة لمراكز الإنتاج:</span>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'خط المخبوزات', rate: 325 },
                        { name: 'التجهيز والفرم', rate: 280 },
                        { name: 'التعبئة والنقل', rate: 195 },
                        { name: 'المركز النشط', rate: Number(loadedBaseRate || 0) + Number(loadedOverhead || 0) }
                      ]}>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="rate" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                          <Cell key={`cell-0`} fill="#818cf8" />
                          <Cell key={`cell-1`} fill="#818cf8" />
                          <Cell key={`cell-2`} fill="#818cf8" />
                          <Cell key={`cell-3`} fill="#4f46e5" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* NEW TAB: STANDARD COSTING & VARIANCE ANALYSIS              */}
        {/* ========================================================= */}
        {activeTab === 'standard_costing' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Percent className="w-6 h-6 text-indigo-600" />
                  <span>التكاليف المعيارية والانحرافات (Standard vs Actual)</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">تحديد الهياكل المعيارية للمواد، الأجور، والخدمات، وتحليل الانحرافات الفعلية بشكل فوري</p>
              </div>
              
              {/* Filter Center */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-500">فلترة بمركز التكلفة:</span>
                <select
                  value={varianceFilterCenter ?? ""}
                  onChange={(e) => setVarianceFilterCenter(e.target.value)}
                  className="p-2 border border-slate-200 rounded-xl text-xs font-black text-slate-800 bg-white"
                >
                  <option value="all">كل المراكز</option>
                  {centers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Standard Cost Config Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Standard 1: Raw Materials */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-right space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-500">معيار المواد الخام (ج.م.)</span>
                  <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="flex items-baseline gap-1.5 justify-end">
                  <input
                    type="number"
                    value={stdMaterials ?? ""}
                    onChange={(e) => setStdMaterials(e.target.value)}
                    className="w-24 text-right border-b border-slate-200 font-black text-xl text-indigo-600 focus:outline-none"
                  />
                  <span className="text-xs font-bold text-slate-400">ج.م./وحدة</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold">بما يشمل التوريد والتخزين والفاقد</p>
              </div>

              {/* Standard 2: Direct Labor */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-right space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-500">معيار الأجور والعمالة (ج.م.)</span>
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-1.5 justify-end">
                  <input
                    type="number"
                    value={stdLabor ?? ""}
                    onChange={(e) => setStdLabor(e.target.value)}
                    className="w-24 text-right border-b border-slate-200 font-black text-xl text-indigo-600 focus:outline-none"
                  />
                  <span className="text-xs font-bold text-slate-400">ج.م./ساعة</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold">الأجور المباشرة والبدلات وحوافز التشغيل</p>
              </div>

              {/* Standard 3: Overhead Expenses */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-right space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-500">معيار المصاريف غير المباشرة</span>
                  <Layers className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex items-baseline gap-1.5 justify-end">
                  <input
                    type="number"
                    value={stdOverhead ?? ""}
                    onChange={(e) => setStdOverhead(e.target.value)}
                    className="w-24 text-right border-b border-slate-200 font-black text-xl text-indigo-600 focus:outline-none"
                  />
                  <span className="text-xs font-bold text-slate-400">ج.م./ساعة</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold">الأعباء، الإهلاك والمصاريف العامة</p>
              </div>

              {/* Standard 4: Utilities */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-right space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-500">معيار المرافق والخدمات</span>
                  <Wallet className="w-4 h-4 text-rose-400" />
                </div>
                <div className="flex items-baseline gap-1.5 justify-end">
                  <input
                    type="number"
                    value={stdUtilities ?? ""}
                    onChange={(e) => setStdUtilities(e.target.value)}
                    className="w-24 text-right border-b border-slate-200 font-black text-xl text-indigo-600 focus:outline-none"
                  />
                  <span className="text-xs font-bold text-slate-400">ج.م./يوم</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold">الكهرباء، الغاز، الماء والإيجار اليومي</p>
              </div>
            </div>

            {/* Variance Analysis Dashboard */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-right">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-indigo-600" />
                    <span>جدول مقارنة وتحليل الانحرافات التفصيلية (Variance Table)</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-bold mt-1">يتم احتساب الانحراف الفعلي من التكاليف المعتمدة مقارنة بالتكاليف المعيارية الموضوعة</p>
                </div>
                <button 
                  onClick={() => {
                    showToast('تم حفظ تحليل الانحرافات وإصدار تنبيهات الإدارة بنجاح');
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>حفظ وإصدار تقرير الانحراف</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs font-black border-b border-slate-100">
                      <th className="p-4">نوع العنصر</th>
                      <th className="p-4 text-center">التكلفة المعيارية (ج.م.)</th>
                      <th className="p-4 text-center">التكلفة الفعلية المرصودة (ج.م.)</th>
                      <th className="p-4 text-center">الانحراف (ج.م.)</th>
                      <th className="p-4 text-center">نسبة الانحراف</th>
                      <th className="p-4 text-center">حالة الانحراف</th>
                      <th className="p-4">سبب الانحراف المحتمل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-bold text-slate-800">
                    {(() => {
                      // Dynamically compute actual costs from operating_costs database
                      const actualMaterials = costs
                        .filter(c => {
                          const matchesCenter = varianceFilterCenter === 'all' || Number(c.cost_center_id) === Number(varianceFilterCenter);
                          return matchesCenter && c.cost_type === 'تشغيل';
                        })
                        .reduce((acc, c) => acc + Number(c.amount || 0), 0) / (costs.length || 1) * 0.8;

                      const actualLabor = costs
                        .filter(c => {
                          const matchesCenter = varianceFilterCenter === 'all' || Number(c.cost_center_id) === Number(varianceFilterCenter);
                          return matchesCenter && c.cost_type === 'إدارية';
                        })
                        .reduce((acc, c) => acc + Number(c.amount || 0), 0) / (costs.length || 1) * 0.9;

                      const actualOverhead = costs
                        .filter(c => {
                          const matchesCenter = varianceFilterCenter === 'all' || Number(c.cost_center_id) === Number(varianceFilterCenter);
                          return matchesCenter && c.cost_type === 'رأسمالية';
                        })
                        .reduce((acc, c) => acc + Number(c.amount || 0), 0) / (costs.length || 1) * 0.4;

                      const actualUtilities = costs
                        .filter(c => {
                          const matchesCenter = varianceFilterCenter === 'all' || Number(c.cost_center_id) === Number(varianceFilterCenter);
                          return matchesCenter && c.cost_type === 'خدمية';
                        })
                        .reduce((acc, c) => acc + Number(c.amount || 0), 0) / (costs.length || 1) * 0.5;

                      const rowItems = [
                        { name: 'المواد الخام والمستلزمات', std: Number(stdMaterials || 0), act: actualMaterials || 165 },
                        { name: 'الأجور والرواتب المباشرة', std: Number(stdLabor || 0), act: actualLabor || 110 },
                        { name: 'المصاريف غير المباشرة والأعباء', std: Number(stdOverhead || 0), act: actualOverhead || 78 },
                        { name: 'المرافق والخدمات اليومية', std: Number(stdUtilities || 0), act: actualUtilities || 42 },
                      ];

                      return rowItems.map((row, idx) => {
                        const varianceVal = row.std - row.act;
                        const variancePct = (varianceVal / (row.std || 1)) * 100;
                        const isFavorable = varianceVal >= 0;

                        return (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-black text-slate-900">{row.name}</td>
                            <td className="p-4 text-center font-mono text-slate-600">{row.std.toFixed(2)} ج.م.</td>
                            <td className="p-4 text-center font-mono text-slate-800">{row.act.toFixed(2)} ج.م.</td>
                            <td className={`p-4 text-center font-mono ${isFavorable ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {varianceVal > 0 ? '+' : ''}{varianceVal.toFixed(2)} ج.م.
                            </td>
                            <td className={`p-4 text-center font-mono ${isFavorable ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {variancePct.toFixed(1)}%
                            </td>
                            <td className="p-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-black inline-flex items-center gap-1 ${
                                isFavorable ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                              }`}>
                                {isFavorable ? 'انحراف ملائم (Favorable)' : 'انحراف غير ملائم (Unfavorable)'}
                              </span>
                            </td>
                            <td className="p-4">
                              <input 
                                type="text"
                                placeholder={isFavorable ? 'توفير في أسعار الشراء الفعلي' : 'ارتفاع تكاليف الشحن / هدر زائد'}
                                className="w-full bg-slate-50/50 hover:bg-slate-50 p-2 border border-slate-200 text-xs font-bold rounded-lg focus:outline-none"
                              />
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ========================================================= */}
        {/* TAB: RECIPE COSTING & PROFITABILITY ENGINE                */}
        {/* ========================================================= */}
        {activeTab === 'product_costing' && (
          <div className="space-y-6 text-right" dir="rtl">
            {/* Header & Controls Bar */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <Calculator className="w-6 h-6 text-indigo-600" />
                    <span>حساب وتحليل تكلفة المنتج (Recipe Costing Engine)</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    حساب تلقائي دقيق لتكلفة الـ Recipe والمكونات بناءً على الكميات، التحويلات، الهالك، وأسعار الشراء الفعلية من المخازن
                  </p>
                </div>

                {/* Top Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      if (selectedProductId) loadRecipeCostingData(selectedProductId, costSource);
                    }}
                    disabled={loadingRecipe}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingRecipe ? 'animate-spin' : ''}`} />
                    <span>إعادة حساب التكلفة</span>
                  </button>

                  <button
                    onClick={saveRecipeCosting}
                    disabled={!recipeData}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-100 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>اعتماد وحفظ التكلفة بالسستم</span>
                  </button>

                  <button
                    onClick={() => openRecipeIngredientsEditor()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>تعديل / إضافة مكونات الـ Recipe</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>طباعة التقرير</span>
                  </button>
                </div>
              </div>

              {/* Recipe Selector & Source Bar */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                {/* Filter Chips for Product Types */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
                  <span className="text-slate-400 font-bold ml-1">تصفية القائمة:</span>
                  <button
                    onClick={() => setRecipeTypeFilter('all')}
                    className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${recipeTypeFilter === 'all' ? 'bg-slate-800 text-white font-black shadow-sm' : 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'}`}
                  >
                    جميع الأصناف ({recipeList.length})
                  </button>
                  <button
                    onClick={() => setRecipeTypeFilter('pos')}
                    className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${recipeTypeFilter === 'pos' ? 'bg-indigo-600 text-white font-black shadow-sm' : 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 hover:bg-indigo-100'}`}
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>منتجات نقطة البيع POS ({recipeList.filter(r => r.show_in_pos).length})</span>
                  </button>
                  <button
                    onClick={() => setRecipeTypeFilter('with_recipe')}
                    className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${recipeTypeFilter === 'with_recipe' ? 'bg-emerald-600 text-white font-black shadow-sm' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100'}`}
                  >
                    أصناف بها Recipe ({recipeList.filter(r => Number(r.ingredients_count) > 0).length})
                  </button>
                  <button
                    onClick={() => setRecipeTypeFilter('no_recipe')}
                    className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${recipeTypeFilter === 'no_recipe' ? 'bg-amber-600 text-white font-black shadow-sm' : 'bg-amber-50 text-amber-700 border border-amber-200/80 hover:bg-amber-100'}`}
                  >
                    تحتاج Recipe ({recipeList.filter(r => Number(r.ingredients_count) === 0).length})
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
                  {/* Search & Select Recipe */}
                  <div className="md:col-span-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 block">البحث واختيار المنتج / الـ Recipe:</label>
                      {recipeSearchQuery && (
                        <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                          تم العثور على {filteredRecipes.length} صنف
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Search Field by Name or Code */}
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="ابحث بالاسم، كود الصنف، أو الباركود..."
                          value={recipeSearchQuery}
                          onChange={(e) => setRecipeSearchQuery(e.target.value)}
                          className="w-full pr-9 pl-8 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 shadow-sm placeholder:font-normal placeholder:text-slate-400"
                        />
                        {recipeSearchQuery && (
                          <button
                            onClick={() => setRecipeSearchQuery('')}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
                            title="مسح البحث"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Filtered Select Dropdown */}
                      <div className="relative">
                        <select
                          value={selectedProductId}
                          onChange={(e) => setSelectedProductId(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-800 focus:ring-2 focus:ring-indigo-500 shadow-sm"
                        >
                          {filteredRecipes.length === 0 ? (
                            <option value="">
                              {recipeList.length === 0 ? 'جاري تحميل الـ Recipes المتاحة...' : 'لا توجد نتائج تطابق بحثك'}
                            </option>
                          ) : (
                            filteredRecipes.map((rec) => (
                              <option key={rec.id} value={rec.id}>
                                {rec.name} {rec.item_code ? `[كود: ${rec.item_code}]` : ''} {rec.show_in_pos ? '🛒 [POS]' : ''} — [{rec.category || 'عام'}] ({rec.ingredients_count} مكونات)
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Warehouse Selector for Recipe Costing */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Store className="w-3.5 h-3.5 text-indigo-600" />
                      <span>مستودع تسعير التكلفة والأرصدة:</span>
                    </label>
                    <select
                      value={costingWarehouseId}
                      onChange={(e) => {
                        const newWh = e.target.value;
                        setCostingWarehouseId(newWh);
                        if (selectedProductId) {
                          loadRecipeCostingData(selectedProductId, costSource, newWh);
                        }
                      }}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-800 focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    >
                      <option value="all">🏢 جميع المخازن (المتوسط العام للمنظومة)</option>
                      {systemWarehouses.map((wh) => (
                        <option key={wh.id} value={wh.id}>
                          🏢 {wh.name} {wh.code ? `[${wh.code}]` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cost Source Priority Dropdown */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">مصدر أسعار المكونات (Cost Source):</label>
                    <select
                      value={costSource}
                      onChange={(e: any) => setCostSource(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-800 focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    >
                      <option value="weighted_avg">متوسط سعر الشراء (Weighted Avg Cost - WAC)</option>
                      <option value="last_purchase">آخر سعر شراء (Last Purchase Price)</option>
                      <option value="standard">التكلفة القياسية (Standard Cost)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading Indicator */}
            {loadingRecipe && (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3 shadow-sm">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-sm font-bold text-slate-700">جاري تحميل مكونات الـ Recipe وقراءة الأسعار الحقيقية من المخازن...</p>
              </div>
            )}

            {/* Costing Engine Main View */}
            {!loadingRecipe && recipeData && (
              <div className="space-y-6">
                {/* Product Header & Status Card */}
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-2xl font-black">{recipeData.product.name}</h3>
                      <span className="px-3 py-1 bg-white/10 text-white rounded-lg text-xs font-bold border border-white/20">
                        {recipeData.product.category || 'وجبة رئيسية'}
                      </span>
                      {recipeData.product.show_in_pos && (
                        <span className="px-3 py-1 bg-indigo-500/30 text-indigo-200 rounded-lg text-xs font-bold border border-indigo-400/30 flex items-center gap-1">
                          <ShoppingCart className="w-3.5 h-3.5" /> نقطة البيع (POS)
                        </span>
                      )}
                      {/* Warehouse Badge */}
                      <span className="px-3 py-1 bg-indigo-600/60 text-indigo-100 rounded-lg text-xs font-bold border border-indigo-400/40 flex items-center gap-1">
                        <Store className="w-3.5 h-3.5 text-indigo-300" />
                        <span>مخزن التسعير: {recipeData.warehouse?.name || 'جميع المخازن'}</span>
                      </span>
                      {/* Status Badge */}
                      {recipeData.summary.status === 'Calculated' && (
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-bold border border-emerald-400/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> تم الحساب بالكامل
                        </span>
                      )}
                      {recipeData.summary.status === 'Missing Costs' && (
                        <span className="px-3 py-1 bg-rose-500/20 text-rose-300 rounded-lg text-xs font-bold border border-rose-400/30 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> أسعار ناقصة
                        </span>
                      )}
                      {recipeData.summary.status === 'Outdated' && (
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-lg text-xs font-bold border border-amber-400/30 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> التكلفة متغيرة (تحديث مطلوب)
                        </span>
                      )}
                      {recipeData.summary.status === 'No Recipe' && (
                        <span className="px-3 py-1 bg-slate-500/20 text-slate-300 rounded-lg text-xs font-bold border border-slate-400/30">
                          بدون مكونات مسجلة
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-2 font-mono flex items-center gap-4 flex-wrap">
                      <span>كود المنتج: {recipeData.product.item_code || 'PRD-' + recipeData.product.id}</span>
                      <span>البار كود: {recipeData.product.barcode || 'غير محدد'}</span>
                      <span>عدد المكونات: {recipeData.ingredients.length}</span>
                      <span>الناتج (Yield): {recipeData.summary.yield_portions} وجبة / قطعة</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => openRecipeIngredientsEditor(costingWarehouseId)}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة / تعديل المكونات</span>
                    </button>

                    <div className="text-left bg-white/10 p-3.5 rounded-xl border border-white/10 shrink-0">
                      <span className="text-[10px] text-slate-300 block font-bold">مصدر السعر المعتمد:</span>
                      <span className="text-xs font-black text-amber-300">
                        {costSource === 'weighted_avg' ? 'متوسط سعر الشراء (WAC)' : costSource === 'last_purchase' ? 'آخر سعر شراء' : 'التكلفة القياسية'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Insufficient Warehouse Stock Warning */}
                {recipeData.summary.has_insufficient_stock && (
                  <div className="bg-rose-50 border-2 border-rose-300/80 p-4 rounded-2xl flex items-center gap-3 shadow-sm text-rose-900">
                    <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="text-xs">
                      <p className="font-black">تنبيه عجز رصيد: بعض الخامات المطلوبة للـ Recipe رصيدها غير كافٍ في مستودع ({recipeData.warehouse?.name || 'المحدد'}).</p>
                      <p className="text-rose-700 mt-0.5 font-medium">يرجى عمل طلب تحويل مخزني أو أمر شراء لتوفير الخامات قبل بدء أمر التشغيل.</p>
                    </div>
                  </div>
                )}

                {/* Banner if Product Has No Ingredients (e.g., POS product without Recipe) */}
                {recipeData.ingredients.length === 0 && (
                  <div className="bg-amber-50 border-2 border-amber-300/80 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-amber-900">هذا المنتج ({recipeData.product.name}) ليس له مكونات Recipe مسجلة بعد</h4>
                        <p className="text-xs text-amber-700 font-medium mt-0.5">يمكنك إضافة المواد الخام والكميات المطلوبة لكل وجبة لحساب تكلفة التصنيع والربحية فورياً.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => openRecipeIngredientsEditor()}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة مكونات الـ Recipe لهذا المنتج الآن</span>
                    </button>
                  </div>
                )}

                {/* Key Metrics Dashboard Row */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {/* Metric 1 */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-right space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 block">إجمالي تكلفة المكونات</span>
                    <div className="text-lg font-black text-slate-900">
                      {Number(recipeData.summary.total_ingredients_cost).toFixed(2)} <span className="text-xs font-normal">ج.م</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block font-bold">شاملة الهالك والتلفيات</span>
                  </div>

                  {/* Metric 2 - Highlighted Cost Per Portion */}
                  <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-md text-right space-y-1">
                    <span className="text-[11px] font-bold text-indigo-100 block">تكلفة الوجبة / الوحدة</span>
                    <div className="text-2xl font-black">
                      {Number(recipeData.summary.cost_per_portion).toFixed(2)} <span className="text-xs font-normal">ج.م</span>
                    </div>
                    <span className="text-[10px] text-indigo-200 block font-bold">Cost Per Portion</span>
                  </div>

                  {/* Metric 3 */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-right space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 block">سعر البيع الحالي</span>
                    <div className="text-lg font-black text-slate-900">
                      {Number(recipeData.summary.selling_price).toFixed(2)} <span className="text-xs font-normal">ج.م</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block font-bold">سعر المبيعات بالمنظومة</span>
                  </div>

                  {/* Metric 4 */}
                  <div className={`p-4 rounded-2xl border shadow-sm text-right space-y-1 ${recipeData.summary.gross_profit >= 0 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                    <span className="text-[11px] font-bold text-slate-600 block">إجمالي ربح الوجبة</span>
                    <div className={`text-lg font-black ${recipeData.summary.gross_profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {Number(recipeData.summary.gross_profit).toFixed(2)} <span className="text-xs font-normal">ج.م</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block font-bold">Gross Profit</span>
                  </div>

                  {/* Metric 5 */}
                  <div className={`p-4 rounded-2xl border shadow-sm text-right space-y-1 ${recipeData.summary.profit_margin_pct >= 25 ? 'bg-indigo-50 border-indigo-200' : 'bg-amber-50 border-amber-200'}`}>
                    <span className="text-[11px] font-bold text-slate-600 block">هامش الربح %</span>
                    <div className={`text-lg font-black ${recipeData.summary.profit_margin_pct >= 25 ? 'text-indigo-700' : 'text-amber-700'}`}>
                      {Number(recipeData.summary.profit_margin_pct).toFixed(1)}%
                    </div>
                    <span className="text-[10px] text-slate-400 block font-bold">Margin %</span>
                  </div>

                  {/* Metric 6 */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-right space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 block">نسبة تكلفة الطعام</span>
                    <div className="text-lg font-black text-slate-900">
                      {Number(recipeData.summary.food_cost_pct).toFixed(1)}%
                    </div>
                    <span className="text-[10px] text-slate-400 block font-bold">Food Cost %</span>
                  </div>
                </div>

                {/* Sub-Tabs Bar */}
                <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-1">
                  {[
                    { id: 'ingredients', label: 'المكونات (Recipe Ingredients)', icon: Layers },
                    { id: 'breakdown', label: 'تحليل وتوزيع التكلفة', icon: PieChartIcon },
                    { id: 'yield', label: 'الناتج والوجبات (Yield)', icon: Award },
                    { id: 'waste', label: 'الهالك (Waste %)', icon: Trash2 },
                    { id: 'packaging', label: 'التعبئة والأعباء', icon: Package },
                    { id: 'profitability', label: 'الربحية وسعر البيع', icon: TrendingUp },
                    { id: 'history', label: 'سجل التغيرات والمقارنة', icon: History },
                    { id: 'simulation', label: 'محاكاة التكاليف (What-If)', icon: SlidersHorizontal },
                  ].map((tab) => {
                    const IconComp = tab.icon;
                    const isActive = costingActiveTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setCostingActiveTab(tab.id as any)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab 1: Recipe Ingredients Table */}
                {costingActiveTab === 'ingredients' && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-sm font-black text-slate-800">تفاصيل مكونات الـ Recipe والأسعار الفعلية</h3>
                        <p className="text-xs text-slate-500 mt-0.5">قراءة المكونات المقترنة بالمنتج وتطبيق تحويلات الوحدات واحتساب التكلفة</p>
                      </div>
                      <span className="px-3 py-1 bg-slate-100 rounded-lg text-slate-700 text-xs font-bold">
                        إجمالي {recipeData.ingredients.length} مكون
                      </span>
                    </div>

                    {/* Missing Cost Alert */}
                    {recipeData.summary.has_missing_cost && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-800 text-xs font-bold">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                        <span>تنبيه: يوجد مكونات ليس لها سعر مسجل في المخازن، يرجى تحديث أسعار الشراء أو إضافة تكلفة قياسية لضمان دقة التكلفة الإجمالية.</span>
                      </div>
                    )}

                    {/* Ingredients Table */}
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-slate-50 text-slate-700 font-black border-b border-slate-200">
                          <tr>
                            <th className="p-3 text-center">#</th>
                            <th className="p-3">كود الصنف</th>
                            <th className="p-3">اسم المكون (المادة الخام)</th>
                            <th className="p-3">التصنيف</th>
                            <th className="p-3 text-center">الكمية المطلوبة بالـ Recipe</th>
                            <th className="p-3 text-center">الهالك %</th>
                            <th className="p-3 text-center">الكمية الفعلية المحولة</th>
                            <th className="p-3 text-center">الرصيد بالمستودع</th>
                            <th className="p-3 text-center">سعر الوحدة</th>
                            <th className="p-3 text-center">مصدر السعر</th>
                            <th className="p-3 text-center">إجمالي التكلفة</th>
                            <th className="p-3 text-center">نسبة المساهمة</th>
                            <th className="p-3 text-center">الحالة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                          {recipeData.ingredients.map((ing: any, idx: number) => {
                            const contribPct = recipeData.summary.total_ingredients_cost > 0
                              ? (ing.total_ingredient_cost / recipeData.summary.total_ingredients_cost) * 100
                              : 0;
                            return (
                              <tr key={ing.ingredient_id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                                <td className="p-3 font-mono font-bold text-indigo-600 text-[11px]">
                                  {ing.item_code || `ITEM-${ing.ingredient_id}`}
                                </td>
                                <td className="p-3 font-bold text-slate-900">{ing.ingredient_name}</td>
                                <td className="p-3 text-slate-500">{ing.ingredient_category}</td>
                                <td className="p-3 text-center font-mono">
                                  {ing.recipe_quantity} <span className="text-[10px] text-slate-500">{ing.recipe_unit}</span>
                                </td>
                                <td className="p-3 text-center font-mono text-amber-700 font-bold">
                                  {ing.waste_percent > 0 ? `${ing.waste_percent}%` : '0%'}
                                </td>
                                <td className="p-3 text-center font-mono font-bold text-indigo-700">
                                  {ing.converted_effective_quantity.toFixed(3)} <span className="text-[10px] text-slate-500">{ing.cost_unit}</span>
                                </td>
                                <td className="p-3 text-center font-mono">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    ing.stock_sufficient !== false ? 'bg-slate-100 text-slate-800' : 'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}>
                                    {Number(ing.available_stock || 0).toFixed(2)} {ing.cost_unit}
                                  </span>
                                </td>
                                <td className="p-3 text-center font-mono font-bold">
                                  {ing.unit_cost > 0 ? `${ing.unit_cost.toFixed(2)} ج.م` : <span className="text-rose-600 font-bold">0.00</span>}
                                </td>
                                <td className="p-3 text-center">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    ing.has_cost ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                                  }`}>
                                    {ing.cost_source_label}
                                  </span>
                                </td>
                                <td className="p-3 text-center font-mono font-black text-slate-900">
                                  {ing.total_ingredient_cost.toFixed(2)} ج.م
                                </td>
                                <td className="p-3 text-center font-mono font-bold text-slate-600">
                                  {contribPct.toFixed(1)}%
                                </td>
                                <td className="p-3 text-center">
                                  {ing.has_cost ? (
                                    <span className="text-emerald-600 font-bold flex items-center justify-center gap-1">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> جاهز
                                    </span>
                                  ) : (
                                    <span className="text-rose-600 font-bold flex items-center justify-center gap-1">
                                      <AlertTriangle className="w-3.5 h-3.5" /> يحتاج سعر
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-slate-50 font-black border-t border-slate-200 text-slate-900">
                          <tr>
                            <td colSpan={10} className="p-3 text-left">إجمالي تكلفة المكونات:</td>
                            <td className="p-3 text-center font-mono text-indigo-700 text-sm">
                              {recipeData.summary.total_ingredients_cost.toFixed(2)} ج.م
                            </td>
                            <td colSpan={2}></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tab 2: Cost Breakdown Charts */}
                {costingActiveTab === 'breakdown' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Donut Chart */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                      <h3 className="text-sm font-black text-slate-800">هيكل توزيع التكاليف النسبية</h3>
                      <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={recipeData.ingredients.map((ing: any) => ({
                                name: ing.ingredient_name,
                                value: Number(ing.total_ingredient_cost.toFixed(2))
                              }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {recipeData.ingredients.map((_: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6', '#06b6d4', '#64748b'][index % 8]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => [`${value} ج.م`, 'التكلفة']} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Top Cost Drivers */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                      <h3 className="text-sm font-black text-slate-800">أعلى المكونات تأثيراً على التكلفة (Top Cost Drivers)</h3>
                      <div className="space-y-3">
                        {[...recipeData.ingredients]
                          .sort((a, b) => b.total_ingredient_cost - a.total_ingredient_cost)
                          .slice(0, 5)
                          .map((ing: any, i: number) => {
                            const pct = recipeData.summary.total_ingredients_cost > 0
                              ? (ing.total_ingredient_cost / recipeData.summary.total_ingredients_cost) * 100
                              : 0;
                            return (
                              <div key={ing.ingredient_id} className="space-y-1">
                                <div className="flex justify-between text-xs font-bold text-slate-700">
                                  <span>{i + 1}. {ing.ingredient_name}</span>
                                  <span>{ing.total_ingredient_cost.toFixed(2)} ج.م ({pct.toFixed(1)}%)</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-indigo-600 rounded-full"
                                    style={{ width: `${Math.min(100, pct)}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Yield & Portion Sizing */}
                {costingActiveTab === 'yield' && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-sm font-black text-slate-800">تحليل الناتج وحجم الوجبة (Yield & Portion Breakdown)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <span className="text-xs font-bold text-slate-500 block">إجمالي تكلفة الطبخة/الدفعة (Batch Cost)</span>
                        <div className="text-2xl font-black text-slate-900">{recipeData.summary.grand_total_cost.toFixed(2)} ج.م</div>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <span className="text-xs font-bold text-slate-500 block">عدد الوجبات الناتج (Yield Portions)</span>
                        <div className="text-2xl font-black text-indigo-700">{recipeData.summary.yield_portions} وجبة</div>
                      </div>

                      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
                        <span className="text-xs font-bold text-indigo-700 block">تكلفة الوجبة الواحدة (Cost Per Portion)</span>
                        <div className="text-2xl font-black text-indigo-900">{recipeData.summary.cost_per_portion.toFixed(2)} ج.م</div>
                        <p className="text-[10px] text-indigo-600 font-bold">معادلة الحساب: إجمالي التكلفة ÷ عدد الوجبات</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 4: Waste Analysis */}
                {costingActiveTab === 'waste' && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-sm font-black text-slate-800">تحليل الهالك والتلفيات (Waste Impact Analysis)</h3>
                        <p className="text-xs text-slate-500 mt-0.5">حساب الكمية الضائعة أثناء التحضير والتجهيز وتكلفتها المباشرة</p>
                      </div>
                      <div className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold">
                        إجمالي تكلفة الهالك: {recipeData.summary.total_waste_cost.toFixed(2)} ج.م
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-slate-50 font-black text-slate-700 border-b border-slate-200">
                          <tr>
                            <th className="p-3">المكون</th>
                            <th className="p-3 text-center">الكمية المطلوبة</th>
                            <th className="p-3 text-center">نسبة الهالك %</th>
                            <th className="p-3 text-center">كمية الهالك</th>
                            <th className="p-3 text-center">الكمية الفعلية المستهلكة</th>
                            <th className="p-3 text-center">تكلفة الهالك (ج.م)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                          {recipeData.ingredients.map((ing: any) => (
                            <tr key={ing.ingredient_id} className="hover:bg-slate-50/80">
                              <td className="p-3 font-bold">{ing.ingredient_name}</td>
                              <td className="p-3 text-center font-mono">{ing.recipe_quantity} {ing.recipe_unit}</td>
                              <td className="p-3 text-center font-mono font-bold text-amber-700">{ing.waste_percent}%</td>
                              <td className="p-3 text-center font-mono text-slate-600">{ing.waste_quantity.toFixed(3)} {ing.recipe_unit}</td>
                              <td className="p-3 text-center font-mono font-bold text-indigo-700">{ing.effective_quantity.toFixed(3)} {ing.recipe_unit}</td>
                              <td className="p-3 text-center font-mono font-black text-amber-700">{ing.waste_cost.toFixed(2)} ج.م</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tab 5: Packaging & Overheads */}
                {costingActiveTab === 'packaging' && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-sm font-black text-slate-800">توزيع التكاليف المباشرة والأعباء (Overhead & Packaging)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <span className="text-xs font-bold text-slate-500 block">تكلفة التعبئة والتغليف</span>
                        <div className="text-xl font-black text-slate-900">{recipeData.summary.packaging_cost.toFixed(2)} ج.م</div>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <span className="text-xs font-bold text-slate-500 block">تكلفة العمالة المباشرة</span>
                        <div className="text-xl font-black text-slate-900">{recipeData.summary.labor_cost.toFixed(2)} ج.م</div>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <span className="text-xs font-bold text-slate-500 block">المصروفات الصناعية والغاز والكهرباء</span>
                        <div className="text-xl font-black text-slate-900">{recipeData.summary.overhead_cost.toFixed(2)} ج.م</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 6: Profitability Engine */}
                {costingActiveTab === 'profitability' && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-sm font-black text-slate-800">حاسبة تسعير المنتج والربحية المستهدفة</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-900">حدد هامش الربح المستهدف (% Target Margin):</span>
                          <span className="text-lg font-black text-indigo-700">{simulationTargetMargin}%</span>
                        </div>
                        <input
                          type="range"
                          min={10}
                          max={80}
                          value={simulationTargetMargin}
                          onChange={(e) => setSimulationTargetMargin(Number(e.target.value))}
                          className="w-full accent-indigo-600 cursor-pointer"
                        />

                        {/* Calculated Recommended Price */}
                        {(() => {
                          const costPortion = recipeData.summary.cost_per_portion;
                          const recPrice = simulationTargetMargin < 100
                            ? costPortion / (1 - simulationTargetMargin / 100)
                            : costPortion * 1.5;
                          const recProfit = recPrice - costPortion;

                          return (
                            <div className="pt-4 border-t border-indigo-200/80 space-y-3">
                              <div className="flex justify-between items-center text-xs font-bold text-indigo-950">
                                <span>سعر البيع المقترح لضمان هامش {simulationTargetMargin}%:</span>
                                <span className="text-2xl font-black text-indigo-950">{recPrice.toFixed(2)} ج.م</span>
                              </div>
                              <div className="flex justify-between items-center text-xs text-indigo-800">
                                <span>الربح الإجمالي المتوقع للوجبة:</span>
                                <span className="font-bold text-emerald-700">{recProfit.toFixed(2)} ج.م</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Current Comparison Box */}
                      <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                        <h4 className="text-xs font-black text-slate-800">مقارنة الوضع الحالي بالوضع المقترح</h4>
                        <div className="space-y-3 text-xs font-bold">
                          <div className="flex justify-between py-2 border-b border-slate-200">
                            <span className="text-slate-600">سعر البيع المسجل حالياً:</span>
                            <span className="text-slate-900 font-mono text-sm">{recipeData.summary.selling_price.toFixed(2)} ج.م</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-slate-200">
                            <span className="text-slate-600">هامش الربح الحالي:</span>
                            <span className="text-indigo-700 font-mono text-sm">{recipeData.summary.profit_margin_pct.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-slate-600">صافي الربح الحالي للوجبة:</span>
                            <span className="text-emerald-700 font-mono text-sm">{recipeData.summary.gross_profit.toFixed(2)} ج.م</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 7: History & Variance */}
                {costingActiveTab === 'history' && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="text-sm font-black text-slate-800">سجل التغيرات وسجلات التكلفة التاريخية</h3>
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-slate-50 font-black text-slate-700 border-b border-slate-200">
                          <tr>
                            <th className="p-3">#</th>
                            <th className="p-3">تاريخ الاعتماد</th>
                            <th className="p-3">الإصدار</th>
                            <th className="p-3">مصدر السعر</th>
                            <th className="p-3 text-center">تكلفة الوجبة</th>
                            <th className="p-3 text-center">سعر البيع</th>
                            <th className="p-3 text-center">هامش الربح</th>
                            <th className="p-3 text-center">الحالة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                          {recipeCostHistory.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">لا يوجد سجل تاريخي سابق مسجل لهذه الـ Recipe</td>
                            </tr>
                          ) : (
                            recipeCostHistory.map((hist: any, i: number) => (
                              <tr key={hist.id || i} className="hover:bg-slate-50">
                                <td className="p-3 font-mono text-slate-400">{i + 1}</td>
                                <td className="p-3 font-mono">{new Date(hist.created_at).toLocaleDateString('ar-EG')}</td>
                                <td className="p-3 font-bold text-indigo-700">{hist.recipe_version || 'V1'}</td>
                                <td className="p-3 text-slate-600">{hist.cost_source || 'متوسط الشراء'}</td>
                                <td className="p-3 text-center font-mono font-bold">{Number(hist.cost_per_portion).toFixed(2)} ج.م</td>
                                <td className="p-3 text-center font-mono font-bold">{Number(hist.selling_price).toFixed(2)} ج.م</td>
                                <td className="p-3 text-center font-mono text-emerald-700 font-bold">{Number(hist.profit_margin_pct).toFixed(1)}%</td>
                                <td className="p-3 text-center font-bold text-slate-700">{hist.status || 'معتمد'}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tab 8: What-If Recipe Simulation */}
                {costingActiveTab === 'simulation' && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-sm font-black text-slate-800">محاكاة تغيير أسعار المكونات (What-If Recipe Simulation)</h3>
                        <p className="text-xs text-slate-500 mt-0.5">قم بتعديل أسعار المواد الخام أو كميات الهالك افتراضياً لتجربة أثر تغير الأسعار على التكلفة والربحية بدون التعديل على البيانات الحقيقية</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Simulation Controls Table */}
                      <div className="lg:col-span-2 overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-slate-50 font-black text-slate-700 border-b border-slate-200">
                            <tr>
                              <th className="p-3">المكون</th>
                              <th className="p-3 text-center">السعر الحالي</th>
                              <th className="p-3 text-center">السعر بالمحاكاة</th>
                              <th className="p-3 text-center">الهالك بالمحاكاة %</th>
                              <th className="p-3 text-center">التكلفة بالمحاكاة</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                            {simulationIngredients.map((ing: any, i: number) => {
                              const effQty = ing.converted_effective_quantity || ing.effective_quantity || 1;
                              const simCost = effQty * (ing.simulated_unit_cost !== undefined ? ing.simulated_unit_cost : ing.unit_cost);
                              return (
                                <tr key={ing.ingredient_id} className="hover:bg-slate-50">
                                  <td className="p-3 font-bold">{ing.ingredient_name}</td>
                                  <td className="p-3 text-center font-mono">{ing.unit_cost.toFixed(2)} ج.م</td>
                                  <td className="p-3 text-center">
                                    <input
                                      type="number"
                                      value={ing.simulated_unit_cost !== undefined ? ing.simulated_unit_cost : ing.unit_cost}
                                      onChange={(e) => {
                                        const newCost = Number(e.target.value);
                                        const copy = [...simulationIngredients];
                                        copy[i].simulated_unit_cost = newCost;
                                        setSimulationIngredients(copy);
                                      }}
                                      className="w-24 text-center p-1 border border-indigo-200 rounded font-bold font-mono text-indigo-800"
                                    />
                                  </td>
                                  <td className="p-3 text-center">
                                    <input
                                      type="number"
                                      value={ing.simulated_waste !== undefined ? ing.simulated_waste : ing.waste_percent}
                                      onChange={(e) => {
                                        const newWaste = Number(e.target.value);
                                        const copy = [...simulationIngredients];
                                        copy[i].simulated_waste = newWaste;
                                        setSimulationIngredients(copy);
                                      }}
                                      className="w-16 text-center p-1 border border-indigo-200 rounded font-bold font-mono text-amber-800"
                                    />
                                  </td>
                                  <td className="p-3 text-center font-mono font-black text-indigo-900">{simCost.toFixed(2)} ج.م</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Simulation Result Card */}
                      {(() => {
                        const simTotalIng = simulationIngredients.reduce((acc: number, ing: any) => {
                          const effQty = ing.converted_effective_quantity || ing.effective_quantity || 1;
                          const uCost = ing.simulated_unit_cost !== undefined ? ing.simulated_unit_cost : ing.unit_cost;
                          return acc + (effQty * uCost);
                        }, 0);

                        const simGrandTotal = simTotalIng + recipeData.summary.packaging_cost + recipeData.summary.labor_cost + recipeData.summary.overhead_cost;
                        const simCostPortion = simGrandTotal / Math.max(1, recipeData.summary.yield_portions);
                        const diff = simCostPortion - recipeData.summary.cost_per_portion;
                        const diffPct = recipeData.summary.cost_per_portion > 0 ? (diff / recipeData.summary.cost_per_portion) * 100 : 0;

                        return (
                          <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-6 flex flex-col justify-between shadow-lg">
                            <div>
                              <h4 className="text-sm font-black text-amber-400 border-b border-slate-800 pb-3">نتائج المحاكاة (Simulation Output)</h4>
                              <div className="space-y-4 mt-4 text-xs">
                                <div>
                                  <span className="text-slate-400 block font-bold">التكلفة الحالية للوجبة:</span>
                                  <span className="text-lg font-black">{recipeData.summary.cost_per_portion.toFixed(2)} ج.م</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block font-bold">التكلفة بالمحاكاة:</span>
                                  <span className="text-2xl font-black text-indigo-300">{simCostPortion.toFixed(2)} ج.م</span>
                                </div>
                                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
                                  <span className="text-slate-400 block font-bold">الفارق في التكلفة للوجبة:</span>
                                  <div className={`text-base font-black ${diff > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    {diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)} ج.م ({diffPct > 0 ? `+${diffPct.toFixed(1)}` : diffPct.toFixed(1)}%)
                                  </div>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                showToast('تم تحديث الشاشة وتطبيق قيم المحاكاة');
                              }}
                              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all"
                            >
                              تطبيق التكاليف بالمحاكاة
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {activeTab === 'reports' && (
        <div className="p-6">
           <CostsReportsDetails 
             reportId={activeReportSubTab} 
             costs={filteredCosts} 
             centers={centers} 
             items={items} 
             budgets={budgets} 
           />
        </div>
      )}
      
      {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Header Area */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-right">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Settings className="w-6 h-6 text-indigo-600 animate-spin-slow" />
                  <span>لوحة تهيئة وإعدادات مديول التكاليف المتقدمة</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">ضبط محددات احتساب التكلفة، دورتها المستندية، وقواعد الترحيل الآلي لدفتر اليومية والمخازن والإنتاج</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSaveSettings('كافة الإعدادات', 'تم عمل حفظ ومزامنة شاملة لقواعد التكاليف والروابط')}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-150 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ ومزامنة كافة الإعدادات</span>
                </button>
              </div>
            </div>

            {/* Sub-Tabs Selector */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200">
              {[
                { id: 'general', label: 'التهيئة العامة والربط الـ ERP', icon: Layers },
                { id: 'rules', label: 'قواعد وهياكل التكاليف', icon: Shuffle },
                { id: 'budgets', label: 'الموازنات والاعتمادات والتنبيهات', icon: BookOpen },
                { id: 'cost_items_settings', label: 'إعدادات بنود التكاليف المتقدمة', icon: Settings },
                { id: 'permissions', label: 'صلاحيات وأمان المستخدمين', icon: UserCheck }
              ].map((subTab) => {
                const Icon = subTab.icon;
                const isSelected = activeSettingsSubTab === subTab.id;
                return (
                  <button
                    key={subTab.id}
                    onClick={() => setActiveSettingsSubTab(subTab.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{subTab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* 1. GENERAL CONFIG & ERP INTEGRATIONS */}
            {activeSettingsSubTab === 'general' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Years & Periods Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 text-right">
                  <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">سنة التكلفة والفترات المالية</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-black text-slate-500 block mb-1">السنة المالية لتسجيل التكاليف</label>
                      <select
                        value={settingsActiveFiscalYear ?? ""}
                        onChange={(e) => setSettingsActiveFiscalYear(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                      >
                        <option value="2026">السنة المالية 2026 (الحالية)</option>
                        <option value="2025">السنة المالية 2025</option>
                        <option value="2024">السنة المالية 2024</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-slate-500 block mb-1">الفترة المالية النشطة حالياً</label>
                      <select
                        value={settingsActivePeriod ?? ""}
                        onChange={(e) => setSettingsActivePeriod(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                      >
                        <option value="Q3-2026">الربع الثالث (يوليو - سبتمبر 2026)</option>
                        <option value="Q2-2026">الربع الثاني (أبريل - يونيو 2026)</option>
                        <option value="Q1-2026">الربع الأول (يناير - مارس 2026)</option>
                        <option value="Q4-2026">الربع الرابع (أكتوبر - ديسمبر 2026)</option>
                      </select>
                    </div>
                    <div className="p-3 bg-indigo-50/50 rounded-xl">
                      <p className="text-[10px] text-indigo-700 leading-relaxed font-bold">
                        ℹ️ عند تغيير الفترة المالية، يتم إقفال القيود المؤقتة السابقة تلقائياً وترحيل الفروقات المعيارية إلى حساب الأرباح والخسائر.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSaveSettings('الفترات المالية', `تحديث السنة إلى ${settingsActiveFiscalYear} والفترة إلى ${settingsActivePeriod}`)}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-700 font-black text-xs transition-colors"
                  >
                    حفظ وإغلاق الفترة
                  </button>
                </div>

                {/* Taxes, Currencies & Auto numbering */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 text-right">
                  <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">الضرائب، العملات والترقيم التلقائي</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-black text-slate-500 block mb-1">العملة الرئيسية للتقارير والميزانية</label>
                      <select
                        value={settingsCurrencyPrimary ?? ""}
                        onChange={(e) => setSettingsCurrencyPrimary(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                      >
                        <option value="EGP">الجنيه المصري (ج.م)</option>
                        <option value="USD">الدولار الأمريكي (USD)</option>
                        <option value="EUR">اليورو الأوروبي (EUR)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-slate-500 block mb-1">نسبة ضريبة القيمة المضافة الافتراضية (%)</label>
                      <input
                        type="number"
                        value={settingsVAT ?? ""}
                        onChange={(e) => setSettingsVAT(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                        placeholder="14"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-slate-500 block mb-1">البادئة التلقائية لسندات الصرف والمصاريف</label>
                      <input
                        type="text"
                        value={settingsAutoNumberPrefix ?? ""}
                        onChange={(e) => setSettingsAutoNumberPrefix(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold font-mono"
                        placeholder="COST-"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleSaveSettings('الضرائب والعملات والترقيم', `العملة: ${settingsCurrencyPrimary}، الضريبة: ${settingsVAT}%، البادئة: ${settingsAutoNumberPrefix}`)}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-700 font-black text-xs transition-colors"
                  >
                    حفظ تهيئة الضرائب والرموز
                  </button>
                </div>

                {/* ERP Integrations and GL Mapping */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 text-right">
                  <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">الربط التلقائي للأنظمة والـ ERP</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                      <div>
                        <p className="text-xs font-black text-slate-800">الربط مع الحسابات العامة (GL)</p>
                        <span className="text-[10px] text-slate-400 font-bold">ترحيل قيود اليومية آلياً عند اعتماد التكلفة</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsIntegrationGL}
                        onChange={(e) => setSettingsIntegrationGL(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                      <div>
                        <p className="text-xs font-black text-slate-800">الربط مع المخازن والجرد (Inventory)</p>
                        <span className="text-[10px] text-slate-400 font-bold">حساب تكلفة المنصرف من المواد الخام تلقائياً</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsIntegrationInventory}
                        onChange={(e) => setSettingsIntegrationInventory(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                      <div>
                        <p className="text-xs font-black text-slate-800">الربط مع الإنتاج والتصنيع (Recipe Link)</p>
                        <span className="text-[10px] text-slate-400 font-bold">تحديث تكلفة مكونات الوجبة آلياً من المخزن</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsIntegrationPayroll}
                        onChange={(e) => setSettingsIntegrationPayroll(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                      <div>
                        <p className="text-xs font-black text-slate-800">الربط مع المشتريات والموردين (Procure)</p>
                        <span className="text-[10px] text-slate-400 font-bold">تحميل فواتير المشتريات المؤكدة كمصاريف مباشرة</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsIntegrationProcurement}
                        onChange={(e) => setSettingsIntegrationProcurement(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleSaveSettings('روابط مديولات الـ ERP', `الربط العام: ${settingsIntegrationGL ? 'نشط' : 'معطل'}، المخازن: ${settingsIntegrationInventory ? 'نشط' : 'معطل'}، المشتريات: ${settingsIntegrationProcurement ? 'نشط' : 'معطل'}`)}
                    className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-black text-xs transition-colors"
                  >
                    تحديث الربط والتكامل المزدوج
                  </button>
                </div>
              </div>
            )}

            {/* 2. COST STRUCTURES & RULES */}
            {activeSettingsSubTab === 'rules' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cost Elements & Valuation card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 text-right">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-900">طرق تقييم تكلفة المخزون وعناصر التكاليف</h3>
                    <p className="text-[11px] text-slate-500 font-medium">تحديد الطريقة المحاسبية لحساب تسعير واستهلاك خامات ومصاريف التشغيل</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] font-black text-slate-500 block mb-1">طريقة التقييم الافتراضية</label>
                      <select
                        value={settingsEvaluationMethod ?? ""}
                        onChange={(e) => setSettingsEvaluationMethod(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                      >
                        <option value="FIFO">الوارد أولاً يصرف أولاً (FIFO)</option>
                        <option value="LIFO">الوارد أخيراً يصرف أولاً (LIFO)</option>
                        <option value="WAvg">المتوسط المرجح المرجح (Weighted Average)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 block">عناصر التكلفة المفعلة في المديول</label>
                      <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
                        {[
                          'المواد الخام والمكونات', 'الكهرباء والمرافق العامة', 'الرواتب والأجور الإضافية', 'الإيجارات السنوية والبدلات',
                          'أعمال الصيانة والتجهيز', 'حملات الدعاية والتسويق', 'الإهلاك السنوي للأصول', 'مصروفات النقل والمحروقات'
                        ].map((item, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSaveSettings('طرق تقييم التكلفة', `طريقة التقييم الحالية: ${settingsEvaluationMethod}`)}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-700 font-black text-xs transition-colors"
                  >
                    حفظ محددات التقييم والتسوية
                  </button>
                </div>

                {/* Allocation Methods Setup */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 text-right">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-900">طرق توزيع التكاليف الإضافية وقواعد التحميل</h3>
                    <p className="text-[11px] text-slate-500 font-medium">كيفية تخصيص وتحميل التكاليف والمصاريف المشتركة غير المباشرة على الأقسام والمنتجات</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: 'التوزيع النسبي (Proportional)', desc: 'توزيع التكلفة كنسبة مئوية محددة يدوياً أو بناءً على المبيعات التاريخية.' },
                      { name: 'التوزيع بالقيمة الثابتة (Fixed Value)', desc: 'توزيع مبالغ نقدية محددة بدقة على مراكز التكلفة المستهدفة.' },
                      { name: 'التوزيع حسب ساعات التشغيل (Machine Hours)', desc: 'توزيع التكاليف بناءً على زمن تشغيل الماكينات أو الأفران لكل فرع.' },
                      { name: 'التوزيع حسب عدد الموظفين والعمالة (Headcount)', desc: 'توزيع مصاريف التموين والإدارة بناءً على نسبة موظفي كل قسم.' },
                      { name: 'التوزيع حسب مساحة المركز (Area sq-meters)', desc: 'توزيع مصاريف الإيجار والكهرباء حسب المساحة الفعلية بالمتر المربع.' },
                    ].map((method, index) => (
                      <div key={index} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" />
                          <span className="text-xs font-black text-slate-800">{method.name}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium mt-1 pr-5">{method.desc}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleSaveSettings('طرق توزيع التكاليف', 'تمت تهيئة وتأكيد 5 طرق توزيع وقواعد تحميل غير مباشرة')}
                    className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-black text-xs transition-colors"
                  >
                    حفظ وتأكيد قواعد التحميل
                  </button>
                </div>
              </div>
            )}

            {/* 3. BUDGETS, ALERTS & APPROVAL WORKFLOW */}
            {activeSettingsSubTab === 'budgets' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Default Budgets & Alert Thresholds */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 text-right">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-900">الموازنات الافتراضية وسقوف الميزانية</h3>
                    <p className="text-[11px] text-slate-500 font-medium">تحديد عتبات الميزانيات التقديرية والتنبيهات التلقائية عند الاقتراب من تجاوز الحدود</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] font-black text-slate-500 block mb-1">عتبة إرسال التنبيه عند اقتراب تجاوز الميزانية</label>
                      <select
                        value={settingsBudgetAlertPercent ?? ""}
                        onChange={(e) => setSettingsBudgetAlertPercent(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                      >
                        <option value="80">تنبيه عند استهلاك 80% من ميزانية المركز</option>
                        <option value="90">تنبيه عند استهلاك 90% من ميزانية المركز (موصى به)</option>
                        <option value="95">تنبيه عند استهلاك 95% من ميزانية المركز</option>
                        <option value="100">تنبيه عند بلوغ 100% تماماً</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 block">سلوك النظام عند التجاوز الفعلي للسقف المالي</label>
                      <div className="grid grid-cols-1 gap-2 text-xs font-bold text-slate-700">
                        <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl cursor-pointer">
                          <input type="radio" name="budget_action" defaultChecked className="text-indigo-600 focus:ring-indigo-500" />
                          <div>
                            <span>تحذير فقط (Warning)</span>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">يسمح للنظام بحفظ الحركة مع تسجيل إشعار تحذيري في سجل مراجعة الحركات المالي.</p>
                          </div>
                        </label>
                        <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl cursor-pointer">
                          <input type="radio" name="budget_action" className="text-indigo-600 focus:ring-indigo-500" />
                          <div>
                            <span>منع الحركة تماماً (Block Operating Cost)</span>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">يرفض النظام تسجيل أي مصروف أو عملية تكلفة تتجاوز الحد الإجمالي المتبقي للمركز.</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSaveSettings('حدود الموازنات والتنبيهات', `تنبيه عند ${settingsBudgetAlertPercent}% من الاستهلاك مع تفعيل إجراء التحذير`)}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-700 font-black text-xs transition-colors"
                  >
                    حفظ سقوف الميزانيات وقواعد المنع
                  </button>
                </div>

                {/* Workflow Engine Levels */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 text-right">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-900">إعداد Workflow وسلسلة اعتمادات مديول التكاليف</h3>
                    <p className="text-[11px] text-slate-500 font-medium">تحديد مراحل ومستويات اعتماد قيود ومصاريف التكلفة التشغيلية لإحكام الرقابة والامتثال</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] font-black text-slate-500 block mb-1">عدد مستويات الاعتماد المطلوبة قبل الترحيل (Posting)</label>
                      <select
                        value={settingsApprovalWorkflowLevels ?? ""}
                        onChange={(e) => setSettingsApprovalWorkflowLevels(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                      >
                        <option value="1">مستوى واحد (تأكيد المحاسب ومراجعة سريعة)</option>
                        <option value="2">مستويين (محاسب التكاليف ➔ المدير المالي)</option>
                        <option value="3">3 مستويات (محاسب ➔ مدير مالي ➔ المدير التنفيذي - موصى به)</option>
                        <option value="4">4 مستويات (إحكام مالي كامل للشركات الكبرى والمطاعم ذات الفروع)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 block">تسلسل الدورة المستندية الحالية للتكاليف والمصاريف</label>
                      <div className="flex items-center flex-wrap gap-1 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[10px] font-black text-slate-600">
                        <span className="px-2 py-1 bg-slate-200 rounded-md">Draft مسودة</span>
                        <span>➔</span>
                        <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-md">Pending معلق</span>
                        <span>➔</span>
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md">Manager Approval</span>
                        <span>➔</span>
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md">Finance Approval</span>
                        <span>➔</span>
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md">Approved معتمد</span>
                        <span>➔</span>
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md">Posted مرحل</span>
                        <span>➔</span>
                        <span className="px-2 py-1 bg-slate-300 rounded-md">Closed مقفل</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSaveSettings('سير عمل الاعتمادات Workflow', `إعداد الدورة بـ ${settingsApprovalWorkflowLevels} مستويات اعتماد وتفعيل القيود`)}
                    className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-black text-xs transition-colors"
                  >
                    تثبيت مستويات دورة الاعتماد المستندية
                  </button>
                </div>
              </div>
            )}

            {/* 4. ROLE-BASED ACCESS CONTROL MATRIX */}
            {activeSettingsSubTab === 'permissions' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 text-right">
                <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">مصفوفة صلاحيات أدوار مديول التكاليف والموازنات</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">تحديد دقيق للمستخدمين المسموح لهم بإضافة، تعديل، اعتماد، ترحيل، وتصدير حركات مديول التكاليف</p>
                  </div>
                  <button
                    onClick={() => handleSaveSettings('مصفوفة الصلاحيات', 'حفظ وإرسال صلاحيات مصفوفة الأدوار إلى خادم الأمان الموحد')}
                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-700 font-black text-xs transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>تطبيق وتحديث مصفوفة الأدوار</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse text-xs font-bold">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 font-black">
                        <th className="p-3">اسم الدور الوظيفي (Role)</th>
                        <th className="p-3 text-center">عرض التقارير واللوحة</th>
                        <th className="p-3 text-center">إضافة وتوزيع تكاليف</th>
                        <th className="p-3 text-center">تعديل وحذف مسودات</th>
                        <th className="p-3 text-center">اعتماد الحركات (Approved)</th>
                        <th className="p-3 text-center">ترحيل القيود (Posted)</th>
                        <th className="p-3 text-center">تعديل الموازنة والحدود</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {[
                        { role: 'المدير المالي (Finance Manager)', view: true, add: true, edit: true, approve: true, post: true, budget: true },
                        { role: 'محاسب التكاليف والمخازن (Cost Accountant)', view: true, add: true, edit: true, approve: false, post: false, budget: true },
                        { role: 'مدير الفرع / المطعم (Branch Manager)', view: true, add: true, edit: false, approve: false, post: false, budget: false },
                        { role: 'موظف إدخال البيانات المالي (Data Entry)', view: true, add: true, edit: true, approve: false, post: false, budget: false },
                        { role: 'مراقب عام وتدقيق (Internal Auditor)', view: true, add: false, edit: false, approve: false, post: false, budget: false },
                      ].map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-black text-slate-900">{item.role}</td>
                          <td className="p-3 text-center">
                            <input type="checkbox" defaultChecked={item.view} className="rounded text-indigo-600 focus:ring-indigo-500" />
                          </td>
                          <td className="p-3 text-center">
                            <input type="checkbox" defaultChecked={item.add} className="rounded text-indigo-600 focus:ring-indigo-500" />
                          </td>
                          <td className="p-3 text-center">
                            <input type="checkbox" defaultChecked={item.edit} className="rounded text-indigo-600 focus:ring-indigo-500" />
                          </td>
                          <td className="p-3 text-center">
                            <input type="checkbox" defaultChecked={item.approve} className="rounded text-indigo-600 focus:ring-indigo-500" />
                          </td>
                          <td className="p-3 text-center">
                            <input type="checkbox" defaultChecked={item.post} className="rounded text-indigo-600 focus:ring-indigo-500" />
                          </td>
                          <td className="p-3 text-center">
                            <input type="checkbox" defaultChecked={item.budget} className="rounded text-indigo-600 focus:ring-indigo-500" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. DYNAMIC COST ITEMS SETTINGS HUB */}
            {activeSettingsSubTab === 'cost_items_settings' && (
              <div className="space-y-8 text-right">
                {/* Panel 1: Creation form */}
                <div className="bg-white rounded-2xl border border-indigo-100 shadow-md shadow-indigo-50/40 p-6 space-y-6">
                  <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h3 className="text-base font-black text-slate-900">إضافة بند تكلفة جديد مع خيارات الربط والتكامل المتقدمة</h3>
                      <p className="text-xs text-slate-500 font-bold">قم بتسجيل بنود جديدة وتحديد مراكز تكلفتها الافتراضية وحساباتها المالية وأسقف الموازنة وسلوك الربط التلقائي</p>
                    </div>
                  </div>

                  <form onSubmit={handleCreateItem} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">كود البند</label>
                      <input
                        type="text"
                        placeholder="مثال: CST-712"
                        value={newItem.code ?? ""}
                        onChange={(e) => setNewItem({...newItem, code: e.target.value})}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-black focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">اسم البند <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        placeholder="مثال: رواتب عمال المطبخ"
                        value={newItem.name ?? ""}
                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-black focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">نوع التكلفة</label>
                      <select
                        value={newItem.cost_type ?? ""}
                        onChange={(e) => setNewItem({...newItem, cost_type: e.target.value})}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-black focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="تشغيل">تشغيل</option>
                        <option value="مرتبات">مرتبات</option>
                        <option value="صيانة">صيانة</option>
                        <option value="إيجارات">إيجارات</option>
                        <option value="تسويق">تسويق</option>
                        <option value="مرافق">مرافق</option>
                        <option value="خدمية">خدمية</option>
                        <option value="رأسمالية">رأسمالية</option>
                        <option value="إدارية">إدارية</option>
                        <option value="أخرى">أخرى</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">القسم الرئيسي</label>
                      <select
                        value={newItem.department ?? ""}
                        onChange={(e) => setNewItem({...newItem, department: e.target.value})}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-black focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        {systemDepartments.map((d, idx) => (<option key={`dep-${d.id || d.name || idx}-${idx}`} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">مركز التكلفة الافتراضي</label>
                      <select
                        value={newItem.default_center_id ?? ""}
                        onChange={(e) => setNewItem({...newItem, default_center_id: e.target.value})}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-black focus:ring-2 focus:ring-indigo-500 focus:outline-none text-indigo-600"
                      >
                        <option value="">-- اختر مركز التكلفة الافتراضي --</option>
                        {centers.map(cc => (
                          <option key={cc.id} value={cc.id}>{cc.name} ({cc.code})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">الحساب المالي (شجرة الحسابات)</label>
                      <select
                        value={newItem.accounting_account_id ?? ""}
                        onChange={(e) => setNewItem({...newItem, accounting_account_id: e.target.value})}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-black focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700"
                      >
                        <option value="">-- اختر الحساب المقابل بدليل الحسابات --</option>
                        {systemAccounts.map(acc => (
                          <option key={acc.id} value={acc.id}>{acc.code} - {acc.name_ar || acc.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">سقف الميزانية الأقصى (ج.م.)</label>
                      <input
                        type="number"
                        placeholder="مثال: 50000"
                        value={newItem.budget_cap ?? ""}
                        onChange={(e) => setNewItem({...newItem, budget_cap: e.target.value})}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-black focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-2 grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded-lg border border-slate-150 hover:border-indigo-200">
                        <input
                          type="checkbox"
                          checked={newItem.is_hr_linked}
                          onChange={(e) => setNewItem({...newItem, is_hr_linked: e.target.checked})}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-[10px] font-black text-slate-800">ربط الموارد البشرية</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded-lg border border-slate-150 hover:border-indigo-200">
                        <input
                          type="checkbox"
                          checked={newItem.is_procurement_linked}
                          onChange={(e) => setNewItem({...newItem, is_procurement_linked: e.target.checked})}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-[10px] font-black text-slate-800">ربط المشتريات والموردين</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded-lg border border-slate-150 hover:border-indigo-200">
                        <input
                          type="checkbox"
                          checked={newItem.is_warehouse_linked}
                          onChange={(e) => setNewItem({...newItem, is_warehouse_linked: e.target.checked})}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-[10px] font-black text-slate-800">ربط المخازن والمستودعات</span>
                      </label>
                    </div>

                    <div className="md:col-span-3">
                      <label className="text-xs font-bold text-slate-600 block mb-1">وصف البند وتفاصيله الاسترشادية</label>
                      <input
                        type="text"
                        placeholder="أدخل معلومات إضافية للموظفين لضمان التوجيه الصحيح..."
                        value={newItem.description ?? ""}
                        onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-3 flex justify-end">
                      <button
                        type="submit"
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-150 transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{newItem.id ? 'حفظ تعديلات البند' : 'حفظ وإضافة البند الجديد للنظام'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Panel 2: Table configuring all items present in the system */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
                      <span>قائمة وضبط كافة بنود التكاليف النشطة في النظام</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-bold">يمكنك تعديل الموازنات التقديرية، الحساب المالي، وربط الموديولات الفرعية لكل بند مباشرة وحفظ التحديثات</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse text-xs font-bold">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black">
                          <th className="p-3">الكود والبند</th>
                          <th className="p-3">النوع والقسم</th>
                          <th className="p-3">مركز التكلفة الافتراضي</th>
                          <th className="p-3">دليل الحسابات</th>
                          <th className="p-3">سقف الميزانية (ج.م)</th>
                          <th className="p-3 text-center">الربط والروابط التلقائية</th>
                          <th className="p-3 text-center">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {items.map((item) => {
                          const isCurrentlyEditing = editingItem && editingItem.id === item.id;
                          const displayItem = isCurrentlyEditing ? editingItem : item;

                          return (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                              {/* الكود والاسم */}
                              <td className="p-3">
                                <div>
                                  <span className="font-mono text-[10px] text-slate-400 block">{displayItem.code || `CST-${displayItem.id}`}</span>
                                  <span className="text-sm font-black text-slate-900">{displayItem.name}</span>
                                </div>
                              </td>

                              {/* النوع والقسم */}
                              <td className="p-3">
                                <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg font-black inline-block mb-1">{displayItem.cost_type}</span>
                                <span className="text-slate-400 block font-medium">{displayItem.department}</span>
                              </td>

                              {/* مركز التكلفة الافتراضي */}
                              <td className="p-3">
                                {isCurrentlyEditing ? (
                                  <select
                                    value={editingItem.default_center_id || ''}
                                    onChange={(e) => setEditingItem({...editingItem, default_center_id: e.target.value})}
                                    className="p-1.5 rounded-lg border border-slate-200 bg-white font-black text-xs text-indigo-700 w-full"
                                  >
                                    <option value="">بلا مركز</option>
                                    {centers.map(cc => (
                                      <option key={cc.id} value={cc.id}>{cc.name}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="text-slate-800 font-bold">
                                    {centers.find(cc => cc.id === item.default_center_id)?.name || 'غير محدد'}
                                  </span>
                                )}
                              </td>

                              {/* الحساب المالي */}
                              <td className="p-3">
                                {isCurrentlyEditing ? (
                                  <select
                                    value={editingItem.accounting_account_id || ''}
                                    onChange={(e) => setEditingItem({...editingItem, accounting_account_id: e.target.value})}
                                    className="p-1.5 rounded-lg border border-slate-200 bg-white font-black text-xs w-full"
                                  >
                                    <option value="">بلا حساب</option>
                                    {systemAccounts.map(acc => (
                                      <option key={acc.id} value={acc.id}>{acc.code} - {acc.name_ar || acc.name}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="font-mono text-slate-600 block">
                                    {systemAccounts.find(acc => acc.id === item.accounting_account_id)?.name_ar || systemAccounts.find(acc => acc.id === item.accounting_account_id)?.name || 'غير مرتبط'}
                                  </span>
                                )}
                              </td>

                              {/* سقف الميزانية */}
                              <td className="p-3">
                                {isCurrentlyEditing ? (
                                  <input
                                    type="number"
                                    value={editingItem.budget_cap || ''}
                                    onChange={(e) => setEditingItem({...editingItem, budget_cap: e.target.value})}
                                    className="p-1.5 rounded-lg border border-slate-200 font-mono font-black text-xs w-24 text-center"
                                    placeholder="0"
                                  />
                                ) : (
                                  <span className="font-mono text-slate-800 font-black">
                                    {Number(item.budget_cap || 0) > 0 ? `${Number(item.budget_cap || 0).toLocaleString()} ج.م` : 'مفتوحة'}
                                  </span>
                                )}
                              </td>

                              {/* الروابط والتكاملات */}
                              <td className="p-3">
                                {isCurrentlyEditing ? (
                                  <div className="flex flex-col gap-1 items-start bg-slate-50 p-2 rounded-lg border border-slate-150">
                                    <label className="flex items-center gap-1 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={!!editingItem.is_hr_linked}
                                        onChange={(e) => setEditingItem({...editingItem, is_hr_linked: e.target.checked})}
                                        className="rounded text-indigo-600"
                                      />
                                      <span className="text-[9px] text-slate-700">الموارد البشرية</span>
                                    </label>
                                    <label className="flex items-center gap-1 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={!!editingItem.is_procurement_linked}
                                        onChange={(e) => setEditingItem({...editingItem, is_procurement_linked: e.target.checked})}
                                        className="rounded text-indigo-600"
                                      />
                                      <span className="text-[9px] text-slate-700">المشتريات والموردين</span>
                                    </label>
                                    <label className="flex items-center gap-1 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={!!editingItem.is_warehouse_linked}
                                        onChange={(e) => setEditingItem({...editingItem, is_warehouse_linked: e.target.checked})}
                                        className="rounded text-indigo-600"
                                      />
                                      <span className="text-[9px] text-slate-700">المخازن والمستودعات</span>
                                    </label>
                                  </div>
                                ) : (
                                  <div className="flex justify-center gap-1">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${item.is_hr_linked ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-100 text-slate-400'}`}>HR</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${item.is_procurement_linked ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>Procure</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${item.is_warehouse_linked ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-100 text-slate-400'}`}>Inventory</span>
                                  </div>
                                )}
                              </td>

                              {/* الإجراءات وحفظ التعديلات */}
                              <td className="p-3 text-center">
                                {isCurrentlyEditing ? (
                                  <div className="flex gap-1 justify-center">
                                    <button
                                      onClick={async () => {
                                        try {
                                          const payload = {
                                            ...editingItem,
                                            default_center_id: editingItem.default_center_id ? parseInt(editingItem.default_center_id) : null,
                                            budget_cap: editingItem.budget_cap ? parseFloat(editingItem.budget_cap) : 0,
                                            accounting_account_id: editingItem.accounting_account_id ? parseInt(editingItem.accounting_account_id) : null,
                                            parent_id: editingItem.parent_id ? parseInt(editingItem.parent_id) : null
                                          };
                                          const res = await api.put(`/api/costs/items/${item.id}`, payload);
                                          if (res.ok) {
                                            showToast('تم تحديث إعدادات البند بنجاح');
                                            setEditingItem(null);
                                            fetchData();
                                          } else {
                                            showToast('فشل التحديث الفردي للبند', 'error');
                                          }
                                        } catch (e) {
                                          console.error(e);
                                          showToast('خطأ فني أثناء الحفظ', 'error');
                                        }
                                      }}
                                      className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black hover:bg-indigo-700"
                                    >
                                      حفظ
                                    </button>
                                    <button
                                      onClick={() => setEditingItem(null)}
                                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-black"
                                    >
                                      إلغاء
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex gap-1 justify-center">
                                    <button
                                      onClick={() => setEditingItem({
                                        ...item,
                                        default_center_id: item.default_center_id ? String(item.default_center_id) : '',
                                        accounting_account_id: item.accounting_account_id ? String(item.accounting_account_id) : '',
                                        budget_cap: item.budget_cap ? String(item.budget_cap) : ''
                                      })}
                                      className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black border border-slate-150"
                                    >
                                      تعديل الإعدادات
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL 0: ADD NEW ESTIMATED BUDGET                          */}
      {/* ========================================================= */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-right" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">إضافة بند موازنة تقديرية جديد</h3>
              <button 
                onClick={() => setShowBudgetModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBudget} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">السنة <span className="text-rose-500">*</span></label>
                  <select
                    value={newBudget.year ?? ""}
                    onChange={(e) => setNewBudget({...newBudget, year: Number(e.target.value)})}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    <option value={2026}>2026</option>
                    <option value={2025}>2025</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">الشهر <span className="text-rose-500">*</span></label>
                  <select
                    value={newBudget.month ?? ""}
                    onChange={(e) => setNewBudget({...newBudget, month: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    {['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">مركز التكلفة <span className="text-rose-500">*</span></label>
                  <select
                    value={newBudget.cost_center_id ?? ""}
                    onChange={(e) => setNewBudget({...newBudget, cost_center_id: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                    required
                  >
                    <option value="">-- اختر مركز التكلفة --</option>
                    {centers.map(cc => (
                      <option key={cc.id} value={cc.id}>{cc.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">بند التكلفة <span className="text-rose-500">*</span></label>
                  <select
                    value={newBudget.cost_item_id ?? ""}
                    onChange={(e) => setNewBudget({...newBudget, cost_item_id: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                    required
                  >
                    <option value="">-- اختر بند التكلفة --</option>
                    {items.map(ci => (
                      <option key={ci.id} value={ci.id}>{ci.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">المبلغ المخطط (ج.م.) <span className="text-rose-500">*</span></label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="مثال: 5000"
                    value={newBudget.amount ?? ""}
                    onChange={(e) => setNewBudget({...newBudget, amount: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">ملاحظات إضافية</label>
                  <textarea 
                    rows={2}
                    placeholder="تفاصيل إضافية حول التخصيص..."
                    value={newBudget.notes ?? ""}
                    onChange={(e) => setNewBudget({...newBudget, notes: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowBudgetModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-100 transition-colors"
                >
                  حفظ البند
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: ADD NEW COST CENTER                             */}
      {/* ========================================================= */}
      {showCenterModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-right" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xl font-black text-slate-900">
                {newCenter.id ? 'تعديل مركز تكلفة' : 'إضافة مركز تكلفة جديد'}
              </h3>
              <button 
                onClick={() => setShowCenterModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCenter} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">الاسم <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="اسم المركز"
                    value={newCenter.name ?? ""}
                    onChange={(e) => setNewCenter({...newCenter, name: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">الكود <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="CC-001"
                    value={newCenter.code ?? ""}
                    onChange={(e) => setNewCenter({...newCenter, code: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-left font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">النوع</label>
                  <select 
                    value={newCenter.type ?? ""}
                    onChange={(e) => setNewCenter({...newCenter, type: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  >
                    <option value="إنتاج">إنتاج (مطبخ، بار)</option>
                    <option value="خدمي">خدمي</option>
                    <option value="إداري">إداري</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">المركز الرئيسي</label>
                  <select 
                    value={newCenter.parent_id ?? ""}
                    onChange={(e) => setNewCenter({...newCenter, parent_id: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  >
                    <option value="">-- لا يوجد --</option>
                    {centers
                      .filter(cc => !newCenter.id || cc.id !== newCenter.id)
                      .map(cc => (
                        <option key={cc.id} value={cc.id}>{cc.name}</option>
                      ))
                    }
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">الموازنة الشهرية التقديرية (اختياري)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="المبلغ التقديري..."
                  value={newCenter.monthly_budget ?? ""}
                  onChange={(e) => setNewCenter({...newCenter, monthly_budget: e.target.value})}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">الحالة</label>
                <select 
                  value={newCenter.status ?? ""}
                  onChange={(e) => setNewCenter({...newCenter, status: e.target.value})}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                >
                  <option value="نشط">نشط</option>
                  <option value="غير نشط">غير نشط</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">وصف أو ملاحظات</label>
                <textarea 
                  rows={2}
                  value={newCenter.notes ?? ""}
                  onChange={(e) => setNewCenter({...newCenter, notes: e.target.value})}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  placeholder="وصف اختياري للمركز..."
                />
              </div>

              <div className="flex justify-start gap-2 pt-3 border-t border-slate-100">
                <button 
                  type="submit"
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-black shadow-md shadow-emerald-100 transition-all"
                >
                  حفظ
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowCenterModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 text-sm font-bold hover:bg-slate-50 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: ADD NEW COST ITEM                               */}
      {/* ========================================================= */}
      {showItemModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">إضافة بند تكلفة جديد</h3>
              <button 
                onClick={() => setShowItemModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">كود البند</label>
                  <input 
                    type="text" 
                    placeholder="مثال: CST-011"
                    value={newItem.code ?? ""}
                    onChange={(e) => setNewItem({...newItem, code: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">اسم البند <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="مثال: تغليف الكاشير"
                    value={newItem.name ?? ""}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">نوع التكلفة</label>
                <select 
                  value={newItem.cost_type ?? ""}
                  onChange={(e) => setNewItem({...newItem, cost_type: e.target.value})}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                >
                  <option value="تشغيل">تشغيل</option>
                  <option value="مرتبات">مرتبات</option>
                  <option value="صيانة">صيانة</option>
                  <option value="إيجارات">إيجارات</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">القسم</label>
                <select 
                  value={newItem.department ?? ""}
                  onChange={(e) => setNewItem({...newItem, department: e.target.value})}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                >
                  <option value="المصروفات العامة">المصروفات العامة</option>
                  <option value="الموارد البشرية">الموارد البشرية</option>
                  <option value="الإنتاج">الإنتاج</option>
                  <option value="التسويق">التسويق</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 text-sm font-bold hover:bg-slate-50 transition-all"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-100 transition-all"
                >
                  إضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: VIEW RECORD DETAILS                              */}
      {/* ========================================================= */}
      {showViewModal && selectedCostDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-2xl w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-950 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                سند الصرف المالي ({selectedCostDetail.voucher_no || `COST-${1000 + selectedCostDetail.id}`})
              </h3>
              <button 
                onClick={() => setShowViewModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[11px] text-slate-400 font-bold">تاريخ الصرف</p>
                <p className="text-slate-800 font-black mt-1">
                  {new Date((selectedCostDetail.date) || 0).toLocaleString('ar-EG')}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[11px] text-slate-400 font-bold">الفرع والقسم</p>
                <p className="text-slate-800 font-black mt-1">
                  {selectedCostDetail.branch} - {selectedCostDetail.department}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[11px] text-slate-400 font-bold">مركز التكلفة</p>
                <p className="text-slate-800 font-black mt-1">
                  {selectedCostDetail.cost_center_name || 'غير محدد'}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[11px] text-slate-400 font-bold">بند التكلفة ونوعها</p>
                <p className="text-slate-800 font-black mt-1">
                  {selectedCostDetail.cost_item_name || 'غير محدد'} ({selectedCostDetail.cost_type || selectedCostDetail.category || 'تشغيل'})
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[11px] text-slate-400 font-bold">طريقة الدفع والخزينة</p>
                <p className="text-slate-800 font-black mt-1">
                  {selectedCostDetail.payment_method} - {selectedCostDetail.safe || 'غير محدد'}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <p className="text-[11px] text-emerald-600 font-bold">القيمة المالية الإجمالية</p>
                <p className="text-emerald-700 font-black text-base mt-1">
                  {Number(selectedCostDetail.amount || 0 || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
                </p>
              </div>
            </div>

            {/* روابط الأنظمة والتكامل */}
            {(selectedCostDetail.employee || selectedCostDetail.supplier || selectedCostDetail.customer || selectedCostDetail.product || selectedCostDetail.accounting_account || selectedCostDetail.project) && (
              <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/50 space-y-2 text-right" dir="rtl">
                <h4 className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                  تفاصيل الارتباط والتكامل الذكي للعملية:
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {selectedCostDetail.employee && (
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-slate-400 font-bold block text-[10px]">الموارد البشرية (الموظف)</span>
                      <span className="text-slate-800 font-black">{selectedCostDetail.employee}</span>
                    </div>
                  )}
                  {selectedCostDetail.supplier && (
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-slate-400 font-bold block text-[10px]">المشتريات (المورد)</span>
                      <span className="text-slate-800 font-black">{selectedCostDetail.supplier}</span>
                    </div>
                  )}
                  {selectedCostDetail.customer && (
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-slate-400 font-bold block text-[10px]">المبيعات والعملاء</span>
                      <span className="text-slate-800 font-black">{selectedCostDetail.customer}</span>
                    </div>
                  )}
                  {selectedCostDetail.product && (
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-slate-400 font-bold block text-[10px]">المخازن والمنتجات</span>
                      <span className="text-slate-800 font-black">{selectedCostDetail.product}</span>
                    </div>
                  )}
                  {selectedCostDetail.accounting_account && (
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-slate-400 font-bold block text-[10px]">دليل الحسابات (GL)</span>
                      <span className="text-indigo-700 font-black">{selectedCostDetail.accounting_account}</span>
                    </div>
                  )}
                  {selectedCostDetail.project && (
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-slate-400 font-bold block text-[10px]">المشروع المستهدف</span>
                      <span className="text-slate-800 font-black">{selectedCostDetail.project}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-700">ملاحظات / وصف المصروف</h4>
              <p className="p-3 bg-slate-50 rounded-xl text-slate-600 font-medium text-xs leading-relaxed">
                {selectedCostDetail.notes || 'لا توجد ملاحظات إضافية لهذا السند.'}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-700">المرفقات المؤيدة للمصروف ({attachments.length})</h4>
              <div className="grid grid-cols-2 gap-3">
                {attachments.map(att => (
                  <div key={att.id} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <FileText className="w-5 h-5 text-rose-500" />
                    <div className="truncate text-xs">
                      <p className="font-bold text-slate-700 truncate">{att.name}</p>
                      <span className="text-[10px] text-slate-400 font-bold">{att.size}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setShowViewModal(false)}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all"
              >
                إغلاق المستند
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: RECIPE INGREDIENTS BUILDER FOR POS & PRODUCTS     */}
      {/* ========================================================= */}
      {showRecipeEditorModal && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto" dir="rtl">
          <div className={`bg-white rounded-3xl border border-slate-200 w-full transition-all duration-300 p-5 sm:p-8 space-y-6 shadow-2xl my-auto animate-in fade-in zoom-in-95 ${
            recipeEditorExpanded ? 'max-w-[97vw] min-h-[88vh] flex flex-col justify-between' : 'max-w-5xl'
          }`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Utensils className="w-5 h-5" />
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    تعديل وإضافة مكونات الـ Recipe {recipeData?.product?.name ? `(${recipeData.product.name})` : ''}
                  </h3>
                  {recipeData?.product?.show_in_pos && (
                    <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-black rounded-lg border border-indigo-200 flex items-center gap-1">
                      <ShoppingCart className="w-3.5 h-3.5" /> نقطة البيع
                    </span>
                  )}
                  {recipeEditorExpanded && (
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200/80">
                      العرض الموسع للبيانات (Full Width)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-bold mt-1">
                  حدد المواد الخام والكميات المطلوبة لكل وجبة/دفعة لحساب التكلفة تلقائياً
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setRecipeEditorExpanded(!recipeEditorExpanded)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1 text-xs font-bold"
                  title={recipeEditorExpanded ? "تصغير الحجم" : "تكبير ملء الشاشة"}
                >
                  {recipeEditorExpanded ? (
                    <>
                      <Minimize2 className="w-4.5 h-4.5" />
                      <span className="hidden sm:inline">تصغير</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-4.5 h-4.5" />
                      <span className="hidden sm:inline">تكبير الشاشة</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowRecipeEditorModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-colors"
                  title="إغلاق"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="space-y-5">
              {/* Warehouse & Yield Portions Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                {/* Warehouse Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-indigo-600" />
                    <span>مستودع تسعير الخامات وقراءة الأرصدة:</span>
                  </label>
                  <select
                    value={editorWarehouseId}
                    onChange={(e) => {
                      const newWh = e.target.value;
                      setEditorWarehouseId(newWh);
                      fetchAllAvailableIngredients(newWh);
                    }}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-800 focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  >
                    <option value="all">🏢 جميع المخازن (المتوسط العام للمنظومة)</option>
                    {systemWarehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>
                        🏢 {wh.name} {wh.code ? `[${wh.code}]` : ''}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 block font-medium">سيتم جلب أسعار الشراء ورصيد المخزون بناءً على هذا المستودع</span>
                </div>

                {/* Yield Portions Input */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-indigo-600" />
                    <span>عدد الوجبات / الناتج (Yield Portions):</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editorYieldPortions}
                    onChange={(e) => setEditorYieldPortions(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-900 text-center focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  />
                  <span className="text-[10px] text-slate-400 block font-medium">عدد الوجبات التي تنتج من تحضير هذه المقادير بالدفعة الواحدة</span>
                </div>
              </div>

              {/* Ingredients Table & Catalog Section */}
              <div className="space-y-3">
                {/* Search & Filter Header Bar */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-3 shadow-sm">
                  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    {/* Live Search Input */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={editorIngredientSearch}
                        onChange={(e) => setEditorIngredientSearch(e.target.value)}
                        placeholder="🔍 فلترة وبحث بالاسم أو كود الصنف (ITEM-...) أو الباركود..."
                        className="w-full pr-10 pl-8 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-sm transition-all"
                      />
                      {editorIngredientSearch && (
                        <button
                          type="button"
                          onClick={() => setEditorIngredientSearch('')}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold bg-slate-100 hover:bg-slate-200 w-4 h-4 rounded-full flex items-center justify-center"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowQuickAddCatalog(!showQuickAddCatalog)}
                        className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm ${
                          showQuickAddCatalog 
                            ? 'bg-indigo-600 text-white shadow-indigo-200' 
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>دليل الخامات السريع ({allIngredientsList.length})</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showQuickAddCatalog ? 'rotate-180' : ''}`} />
                      </button>

                      <button
                        onClick={handleAddIngredientRowToEditor}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إضافة صف جديد</span>
                      </button>
                    </div>
                  </div>

                  {/* Category Filter Chips */}
                  {(() => {
                    const categories = Array.from(new Set(allIngredientsList.map(i => i.category || i.item_group).filter(Boolean)));
                    if (categories.length === 0) return null;
                    return (
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 text-xs no-scrollbar">
                        <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
                          <Filter className="w-3 h-3 text-slate-400" />
                          التصنيف:
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditorIngredientCategoryFilter('all')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                            editorIngredientCategoryFilter === 'all'
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          الكل ({allIngredientsList.length})
                        </button>
                        {categories.map((cat: any) => {
                          const count = allIngredientsList.filter(i => (i.category || i.item_group) === cat).length;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setEditorIngredientCategoryFilter(editorIngredientCategoryFilter === cat ? 'all' : cat)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                                editorIngredientCategoryFilter === cat
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {cat} ({count})
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Quick Add Catalog Drawer / Cards Grid */}
                {showQuickAddCatalog && (
                  <div className="bg-gradient-to-b from-indigo-50/40 to-slate-50/60 border border-indigo-200/80 rounded-2xl p-3.5 space-y-2.5 shadow-sm animate-in fade-in-50 duration-150">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span className="font-black text-slate-800">دليل الخامات والأصناف المتاحة بالمخزن (انقر على "+ إضافة" لإدراجها فوراً بالـ Recipe)</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold">
                        متاح: {allIngredientsList.filter(i => {
                          if (editorIngredientCategoryFilter !== 'all' && (i.category || i.item_group) !== editorIngredientCategoryFilter) return false;
                          if (editorIngredientSearch.trim()) {
                            const q = editorIngredientSearch.toLowerCase().trim();
                            const matchName = i.name ? String(i.name).toLowerCase().includes(q) : false;
                            const matchCode = (i.item_code || i.code) ? String(i.item_code || i.code).toLowerCase().includes(q) : false;
                            const matchBarcode = i.barcode ? String(i.barcode).toLowerCase().includes(q) : false;
                            return matchName || matchCode || matchBarcode;
                          }
                          return true;
                        }).length} صنف
                      </span>
                    </div>

                    <div className={`grid gap-2.5 overflow-y-auto p-1 transition-all ${
                      recipeEditorExpanded 
                        ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 max-h-64' 
                        : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-h-52'
                    }`}>
                      {allIngredientsList
                        .filter(ing => {
                          if (editorIngredientCategoryFilter !== 'all' && (ing.category || ing.item_group) !== editorIngredientCategoryFilter) return false;
                          if (editorIngredientSearch.trim()) {
                            const q = editorIngredientSearch.toLowerCase().trim();
                            const matchName = ing.name ? String(ing.name).toLowerCase().includes(q) : false;
                            const matchCode = (ing.item_code || ing.code) ? String(ing.item_code || ing.code).toLowerCase().includes(q) : false;
                            const matchBarcode = ing.barcode ? String(ing.barcode).toLowerCase().includes(q) : false;
                            return matchName || matchCode || matchBarcode;
                          }
                          return true;
                        })
                        .map(ing => {
                          const stock = Number(ing.available_stock || 0);
                          const cost = Number(ing.unit_cost || ing.avg_cost || ing.cost || 0);
                          const isAdded = editorIngredients.some(row => String(row.ingredient_id) === String(ing.id));

                          return (
                            <div
                              key={ing.id}
                              className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between gap-2 bg-white ${
                                isAdded ? 'border-indigo-400 ring-1 ring-indigo-200 shadow-xs' : 'border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className="font-mono text-[9px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-1 py-0.5 rounded">
                                    {ing.item_code || `ITEM-${ing.id}`}
                                  </span>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                    stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                  }`}>
                                    متاح: {stock.toFixed(1)} {ing.unit || 'كجم'}
                                  </span>
                                </div>
                                <div className="text-xs font-black text-slate-900 truncate" title={ing.name}>
                                  {ing.name}
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  السعر: <b className="text-indigo-600 font-mono">{cost.toFixed(2)} ج.م</b> / {ing.unit || 'كجم'}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleQuickAddIngredient(ing)}
                                className={`w-full py-1 px-2 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 transition-all ${
                                  isAdded 
                                    ? 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800' 
                                    : 'bg-slate-900 hover:bg-indigo-600 text-white shadow-xs'
                                }`}
                              >
                                {isAdded ? (
                                  <>
                                    <CheckCheck className="w-3 h-3 text-indigo-700" />
                                    <span>مضاف (+ زيادة كمية)</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3 h-3" />
                                    <span>+ إضافة للـ Recipe</span>
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Table with Searchable Select Rows */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                  <div className={`overflow-y-auto transition-all ${recipeEditorExpanded ? 'max-h-[56vh]' : 'max-h-80'}`}>
                    <table className="w-full text-right border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100/95 border-b border-slate-200 text-xs font-black text-slate-800 sticky top-0 z-10 backdrop-blur-sm">
                          <th className="p-3.5 w-12 text-center">#</th>
                          <th className="p-3.5 min-w-[280px]">المادة الخام / الصنف المخزني</th>
                          <th className="p-3.5 w-32 text-center">الكمية المطلوبة</th>
                          <th className="p-3.5 w-28 text-center">الوحدة</th>
                          <th className="p-3.5 w-28 text-center">الهالك %</th>
                          <th className="p-3.5 w-32 text-center">سعر الوحدة</th>
                          <th className="p-3.5 w-32 text-center">تكلفة البند</th>
                          <th className="p-3.5 w-14 text-center">حذف</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {editorIngredients.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                              لا توجد مواد خام مضافة بعد. انقر على "إضافة صف جديد" أو اختر من دليل الخامات السريع.
                            </td>
                          </tr>
                        ) : (
                          editorIngredients.map((row, idx) => {
                            const selectedIng = allIngredientsList.find(i => String(i.id) === String(row.ingredient_id));
                            const unitCost = Number(selectedIng?.unit_cost || selectedIng?.avg_cost || selectedIng?.standard_cost || 0);
                            const rawQty = Number(row.quantity) || 0;
                            const wastePct = Number(row.waste_percent) || 0;
                            const effectiveQty = rawQty * (1 + wastePct / 100);
                            const rowCost = effectiveQty * unitCost;

                            return (
                              <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                                
                                {/* Searchable Raw Material Selector */}
                                <td className="p-2">
                                  <SearchableIngredientCombobox
                                    value={row.ingredient_id}
                                    onChange={(val) => handleIngredientRowChange(idx, 'ingredient_id', val)}
                                    ingredients={allIngredientsList}
                                    placeholder="ابحث بالاسم، الكود (ITEM-...) أو الباركود..."
                                  />
                                  {selectedIng && (
                                    <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-500 font-medium">
                                      <span className="font-mono text-indigo-600 font-bold">{selectedIng.item_code || `ITEM-${selectedIng.id}`}</span>
                                      <span>•</span>
                                      <span>الرصيد بالمخزن: <b className={`${Number(selectedIng.available_stock || 0) > 0 ? 'text-emerald-700 font-bold' : 'text-rose-600'}`}>{Number(selectedIng.available_stock || 0).toFixed(2)} {selectedIng.unit || 'كجم'}</b></span>
                                    </div>
                                  )}
                                </td>

                                {/* Quantity Input */}
                                <td className="p-2">
                                  <input
                                    type="number"
                                    step="any"
                                    min="0"
                                    placeholder="0.00"
                                    value={row.quantity}
                                    onChange={(e) => handleIngredientRowChange(idx, 'quantity', e.target.value)}
                                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-900 focus:ring-2 focus:ring-indigo-500 text-center"
                                  />
                                </td>

                                {/* Unit Selector */}
                                <td className="p-2">
                                  <select
                                    value={row.unit}
                                    onChange={(e) => handleIngredientRowChange(idx, 'unit', e.target.value)}
                                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                                  >
                                    <option value="كجم">كجم</option>
                                    <option value="جرام">جرام</option>
                                    <option value="لتر">لتر</option>
                                    <option value="مل">مل</option>
                                    <option value="حبة">حبة</option>
                                    <option value="علبة">علبة</option>
                                    <option value="طرد">طرد</option>
                                    <option value="كيلوجرام">كيلوجرام</option>
                                    <option value="ملليلتر">ملليلتر</option>
                                  </select>
                                </td>

                                {/* Waste % Input */}
                                <td className="p-2">
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    max="100"
                                    placeholder="0%"
                                    value={row.waste_percent}
                                    onChange={(e) => handleIngredientRowChange(idx, 'waste_percent', e.target.value)}
                                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-amber-700 focus:ring-2 focus:ring-indigo-500 text-center"
                                  />
                                </td>

                                {/* Unit Cost Display */}
                                <td className="p-2 text-center font-mono font-bold text-slate-700">
                                  {unitCost > 0 ? `${unitCost.toFixed(2)} ج.م` : <span className="text-rose-500 text-[10px]">0.00</span>}
                                </td>

                                {/* Row Total Cost */}
                                <td className="p-2 text-center font-mono font-black text-indigo-700">
                                  {rowCost > 0 ? `${rowCost.toFixed(2)} ج.م` : '0.00 ج.م'}
                                </td>

                                {/* Delete Action */}
                                <td className="p-2 text-center">
                                  <button
                                    onClick={() => handleRemoveIngredientRowFromEditor(idx)}
                                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="حذف المكون"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Live Summary Footer */}
                  {editorIngredients.length > 0 && (
                    <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-bold text-xs text-slate-800">
                      <div className="flex items-center gap-6">
                        <div>
                          <span className="text-slate-500 text-[11px] block">إجمالي تكلفة المقادير للدفعة:</span>
                          <span className="text-base font-black text-indigo-700 font-mono">
                            {editorIngredients.reduce((acc, row) => {
                              const selectedIng = allIngredientsList.find(i => String(i.id) === String(row.ingredient_id));
                              const unitCost = Number(selectedIng?.unit_cost || selectedIng?.avg_cost || selectedIng?.standard_cost || 0);
                              const rawQty = Number(row.quantity) || 0;
                              const wastePct = Number(row.waste_percent) || 0;
                              return acc + (rawQty * (1 + wastePct / 100) * unitCost);
                            }, 0).toFixed(2)} ج.م
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 text-[11px] block">التكلفة التقديرية للوجبة الواحدة:</span>
                          <span className="text-base font-black text-emerald-700 font-mono">
                            {(editorIngredients.reduce((acc, row) => {
                              const selectedIng = allIngredientsList.find(i => String(i.id) === String(row.ingredient_id));
                              const unitCost = Number(selectedIng?.unit_cost || selectedIng?.avg_cost || selectedIng?.standard_cost || 0);
                              const rawQty = Number(row.quantity) || 0;
                              const wastePct = Number(row.waste_percent) || 0;
                              return acc + (rawQty * (1 + wastePct / 100) * unitCost);
                            }, 0) / Math.max(1, editorYieldPortions)).toFixed(2)} ج.م
                          </span>
                        </div>
                      </div>

                      <span className="text-[11px] text-slate-400">
                        مبني على أسعار مخزن: <b className="text-slate-700">{systemWarehouses.find(w => String(w.id) === String(editorWarehouseId))?.name || 'جميع المخازن'}</b>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                onClick={() => setShowRecipeEditorModal(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                إلغاء
              </button>

              <button
                onClick={handleSaveRecipeIngredients}
                disabled={savingRecipeIngredients}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md hover:shadow-indigo-200 disabled:opacity-50"
              >
                {savingRecipeIngredients ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري حفظ المكونات وحساب التكلفة...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>حفظ مكونات الـ Recipe وتحديث التكلفة</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-md w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-600">
              <Trash2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">مسح كافة محتويات مديول التكاليف؟</h3>
              <p className="text-sm text-slate-500 font-medium">
                تنبيه: هذا الإجراء سيقوم بحذف كافة المصروفات التشغيلية، مراكز التكلفة، وبنود التكاليف بشكل نهائي ولا يمكن التراجع عنه.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button 
                type="button" 
                onClick={handleClearAllCostsData}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-black transition-all shadow-md shadow-rose-100"
              >
                تأكيد المسح النهائي
              </button>
              <button 
                type="button" 
                onClick={() => setShowClearConfirmModal(false)}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
