import React, { useState, useEffect } from 'react';
import { Upload, Download, Image as ImageIcon, Play, Database, Check, X, AlertCircle } from 'lucide-react';

interface KnowledgeBaseProps {
  language: string;
  onNavigate?: (window: string) => void;
}

interface ProductRow {
  product_no: string;
  product_name: string;
  sku: string;
  description: string;
  package_type: string;
  cities: string;
  webpage_link: string;
  product_image: string;
  video_link: string;
  price_a_eur: number;
  delivery_price_eur: number;
  sum_free_delivery_eur: number;
  stock_actual: number;
  delivery_time_hours: number;
  payment_reminder_days: number;
  supplier_contact_details: string;
  supplier_company_services: string;
  warehouse_physical_address: string;
  is_active: boolean;
  last_updated: string;
}

interface ServiceRow {
  service_no: string;
  service_name: string;
  sku: string;
  service_subcategory: string;
  service_category: string;
  unit: string;
  duration_hours: number;
  format: string;
  description: string;
  included: string;
  not_included: string;
  what_guarantee: string;
  what_not_guarantee: string;
  suitable_for: string;
  not_suitable_for: string;
  specialist_initials: string;
  specialist_area: string;
  webpage_link: string;
  product_image: string;
  video_link: string;
  price_a_eur: number;
  payment_reminder_days: number;
  stock_actual: number;
  location: string;
  specialist_contacts: string;
  company_name: string;
  details: string;
  is_active: boolean;
  last_updated: string;
}

interface KBRegistryEntry {
  kb_id: string;
  kb_name: string;
  kb_type: 'Product' | 'Service';
  linked_company: string;
  total_rows: number;
  media_count: number;
  activated_at: string;
  status: 'Activated' | 'Tokens Missing' | 'Error';
}

interface Company {
  name: string;
  type: 'product' | 'service';
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ language, onNavigate }) => {
  const [kbType, setKbType] = useState<'Product' | 'Service'>('Product');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [productRows, setProductRows] = useState<ProductRow[]>([]);
  const [serviceRows, setServiceRows] = useState<ServiceRow[]>([]);
  const [registry, setRegistry] = useState<KBRegistryEntry[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [kbName, setKbName] = useState('');

  useEffect(() => {
    const storedCompanies = localStorage.getItem('companies');
    if (storedCompanies) {
      const companiesData = JSON.parse(storedCompanies);
      setCompanies(companiesData.map((c: any) => ({
        name: c.name,
        type: c.type || 'product'
      })));
    }

    const storedProductRows = localStorage.getItem('kb_product_rows');
    if (storedProductRows) {
      setProductRows(JSON.parse(storedProductRows));
    } else {
      const demoProduct: ProductRow = {
        product_no: 'RSR-PROD-009',
        product_name: 'Gourmet Canarian Set "Taste of Tenerife"',
        sku: '333',
        description: 'Gift box with mojo sauces (red & green), vacuumed wrinkled potatoes, Canarian honey, goat cheese, spices and recipes. Take the taste of Tenerife home!',
        package_type: 'Set',
        cities: '["Los Gigantes","Santa Cruz de Tenerife","Puerto de la Cruz"]',
        webpage_link: 'https://www.royalsunresort.com/culinary-gifts',
        product_image: 'https://res.cloudinary.com/dwhqflphd/image/upload/v1763381651/9_a2nfjy.png',
        video_link: '',
        price_a_eur: 54,
        delivery_price_eur: 18,
        sum_free_delivery_eur: 150,
        stock_actual: 45,
        delivery_time_hours: 48,
        payment_reminder_days: 23,
        supplier_contact_details: '+34 922 867 021, reservas@royalsunresort.com, Hotel Administration',
        supplier_company_services: 'Royal Sun Resort - gastronomic souvenirs',
        warehouse_physical_address: 'Royal Sun Resort',
        is_active: false,
        last_updated: new Date().toISOString()
      };
      setProductRows([demoProduct]);
      localStorage.setItem('kb_product_rows', JSON.stringify([demoProduct]));
    }

    const storedServiceRows = localStorage.getItem('kb_service_rows');
    if (storedServiceRows) {
      setServiceRows(JSON.parse(storedServiceRows));
    } else {
      const demoService: ServiceRow = {
        service_no: 'RSR-SERV-011',
        service_name: 'Romantic Beach Dinner "Sunset Romance"',
        sku: '11',
        service_subcategory: 'Gastronomy / Romantic Dinner',
        service_category: 'Special Events',
        unit: 'Dinner',
        duration_hours: 2.5,
        format: 'On-site / Beach',
        description: 'Private romantic dinner for two on the hotel\'s private beach. Candlelit table, 4-course menu by the chef, a bottle of Cava, live guitarist, optional fireworks (extra).',
        included: 'Private table, decor (candles, petals, lanterns), 4-course menu, bottle of Cava DO, mineral water, 30-min live music, personal waiter',
        not_included: 'Fireworks (150€), extra alcohol, photographer (available)',
        what_guarantee: 'Romantic atmosphere, unforgettable evening, quality food, live music by the ocean',
        what_not_guarantee: 'No guarantee in severe weather (we will move indoors), no guarantee of total privacy (other guests may be visible at distance)',
        suitable_for: 'Couples, proposals, anniversaries, honeymoons',
        not_suitable_for: 'Groups >2, children',
        specialist_initials: 'Laura D.',
        specialist_area: 'Event manager - romantic events, 9 years experience',
        webpage_link: 'https://www.royalsunresort.com/romantic-dinner',
        product_image: 'https://res.cloudinary.com/dwhqflphd/image/upload/v1763381690/11_uuusbt.jpg',
        video_link: '',
        price_a_eur: 320,
        payment_reminder_days: 23,
        stock_actual: 6,
        location: 'Private beach Royal Sun Resort, Los Gigantes, Tenerife',
        specialist_contacts: '+34 922 867 021, events@royalsunresort.com',
        company_name: 'Royal Sun Resort - Special Events',
        details: 'Book min 72h, inform dietary preferences, dinner starts at sunset (time to be confirmed)',
        is_active: false,
        last_updated: new Date().toISOString()
      };
      setServiceRows([demoService]);
      localStorage.setItem('kb_service_rows', JSON.stringify([demoService]));
    }

    const storedRegistry = localStorage.getItem('kb_registry');
    if (storedRegistry) {
      setRegistry(JSON.parse(storedRegistry));
    } else {
      const sampleRegistry: KBRegistryEntry[] = [
        {
          kb_id: 'KB-1733241600000',
          kb_name: 'Royal Sun Resort Products - Culinary Collection',
          kb_type: 'Product',
          linked_company: 'Royal Sun Resort',
          total_rows: 1,
          media_count: 1,
          activated_at: new Date('2024-12-03T10:00:00Z').toISOString(),
          status: 'Activated'
        },
        {
          kb_id: 'KB-1733328000000',
          kb_name: 'Royal Sun Resort Services - Special Events',
          kb_type: 'Service',
          linked_company: 'Royal Sun Resort',
          total_rows: 1,
          media_count: 1,
          activated_at: new Date('2024-12-04T09:00:00Z').toISOString(),
          status: 'Activated'
        }
      ];
      setRegistry(sampleRegistry);
      localStorage.setItem('kb_registry', JSON.stringify(sampleRegistry));
    }
  }, []);

  const filteredCompanies = companies.filter(c =>
    kbType === 'Product' ? c.type === 'product' : c.type === 'service'
  );

  const handleAddRow = () => {
    if (kbType === 'Product') {
      const newRow: ProductRow = {
        product_no: `RSR-PROD-${String(productRows.length + 10).padStart(3, '0')}`,
        product_name: '',
        sku: '',
        description: '',
        package_type: '',
        cities: '',
        webpage_link: '',
        product_image: '',
        video_link: '',
        price_a_eur: 0,
        delivery_price_eur: 0,
        sum_free_delivery_eur: 0,
        stock_actual: 0,
        delivery_time_hours: 0,
        payment_reminder_days: 0,
        supplier_contact_details: '',
        supplier_company_services: '',
        warehouse_physical_address: '',
        is_active: false,
        last_updated: new Date().toISOString()
      };
      const updated = [...productRows, newRow];
      setProductRows(updated);
      localStorage.setItem('kb_product_rows', JSON.stringify(updated));
    } else {
      const newRow: ServiceRow = {
        service_no: `RSR-SERV-${String(serviceRows.length + 12).padStart(3, '0')}`,
        service_name: '',
        sku: '',
        service_subcategory: '',
        service_category: '',
        unit: '',
        duration_hours: 0,
        format: '',
        description: '',
        included: '',
        not_included: '',
        what_guarantee: '',
        what_not_guarantee: '',
        suitable_for: '',
        not_suitable_for: '',
        specialist_initials: '',
        specialist_area: '',
        webpage_link: '',
        product_image: '',
        video_link: '',
        price_a_eur: 0,
        payment_reminder_days: 0,
        stock_actual: 0,
        location: '',
        specialist_contacts: '',
        company_name: '',
        details: '',
        is_active: false,
        last_updated: new Date().toISOString()
      };
      const updated = [...serviceRows, newRow];
      setServiceRows(updated);
      localStorage.setItem('kb_service_rows', JSON.stringify(updated));
    }
  };

  const handleDeleteRow = (index: number) => {
    if (kbType === 'Product') {
      const updated = productRows.filter((_, i) => i !== index);
      setProductRows(updated);
      localStorage.setItem('kb_product_rows', JSON.stringify(updated));
    } else {
      const updated = serviceRows.filter((_, i) => i !== index);
      setServiceRows(updated);
      localStorage.setItem('kb_service_rows', JSON.stringify(updated));
    }
  };

  const handleImportCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
          setCsvHeaders(headers);
          const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const row: any = {};
            headers.forEach((h, i) => {
              row[h] = values[i] || '';
            });
            return row;
          });
          setCsvData(data);
          setShowImportModal(true);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const confirmImport = () => {
    if (kbType === 'Product') {
      const newRows: ProductRow[] = csvData.map(row => ({
        product_no: row.product_no || `RSR-PROD-${Date.now()}`,
        product_name: row.product_name || '',
        sku: row.sku || '',
        description: row.description || '',
        package_type: row.package_type || '',
        cities: row.cities || '',
        webpage_link: row.webpage_link || '',
        product_image: row.product_image || '',
        video_link: row.video_link || '',
        price_a_eur: parseFloat(row.price_a_eur) || 0,
        delivery_price_eur: parseFloat(row.delivery_price_eur) || 0,
        sum_free_delivery_eur: parseFloat(row.sum_free_delivery_eur) || 0,
        stock_actual: parseInt(row.stock_actual) || 0,
        delivery_time_hours: parseInt(row.delivery_time_hours) || 0,
        payment_reminder_days: parseInt(row.payment_reminder_days) || 0,
        supplier_contact_details: row.supplier_contact_details || '',
        supplier_company_services: row.supplier_company_services || '',
        warehouse_physical_address: row.warehouse_physical_address || '',
        is_active: row.is_active === 'true' || false,
        last_updated: new Date().toISOString()
      }));
      const updated = [...productRows, ...newRows];
      setProductRows(updated);
      localStorage.setItem('kb_product_rows', JSON.stringify(updated));
    } else {
      const newRows: ServiceRow[] = csvData.map(row => ({
        service_no: row.service_no || `RSR-SERV-${Date.now()}`,
        service_name: row.service_name || '',
        sku: row.sku || '',
        service_subcategory: row.service_subcategory || '',
        service_category: row.service_category || '',
        unit: row.unit || '',
        duration_hours: parseFloat(row.duration_hours) || 0,
        format: row.format || '',
        description: row.description || '',
        included: row.included || '',
        not_included: row.not_included || '',
        what_guarantee: row.what_guarantee || '',
        what_not_guarantee: row.what_not_guarantee || '',
        suitable_for: row.suitable_for || '',
        not_suitable_for: row.not_suitable_for || '',
        specialist_initials: row.specialist_initials || '',
        specialist_area: row.specialist_area || '',
        webpage_link: row.webpage_link || '',
        product_image: row.product_image || '',
        video_link: row.video_link || '',
        price_a_eur: parseFloat(row.price_a_eur) || 0,
        payment_reminder_days: parseInt(row.payment_reminder_days) || 0,
        stock_actual: parseInt(row.stock_actual) || 0,
        location: row.location || '',
        specialist_contacts: row.specialist_contacts || '',
        company_name: row.company_name || '',
        details: row.details || '',
        is_active: row.is_active === 'true' || false,
        last_updated: new Date().toISOString()
      }));
      const updated = [...serviceRows, ...newRows];
      setServiceRows(updated);
      localStorage.setItem('kb_service_rows', JSON.stringify(updated));
    }
    setShowImportModal(false);
    setCsvData([]);
    setCsvHeaders([]);
  };

  const handleExportCSV = () => {
    let headers: string[];
    let rows: any[];

    if (kbType === 'Product') {
      headers = [
        'product_no', 'product_name', 'sku', 'description', 'package_type', 'cities',
        'webpage_link', 'product_image', 'video_link', 'price_a_eur', 'delivery_price_eur',
        'sum_free_delivery_eur', 'stock_actual', 'delivery_time_hours', 'payment_reminder_days',
        'supplier_contact_details', 'supplier_company_services', 'warehouse_physical_address',
        'is_active', 'last_updated'
      ];
      rows = productRows;
    } else {
      headers = [
        'service_no', 'service_name', 'sku', 'service_subcategory', 'service_category', 'unit',
        'duration_hours', 'format', 'description', 'included', 'not_included', 'what_guarantee',
        'what_not_guarantee', 'suitable_for', 'not_suitable_for', 'specialist_initials',
        'specialist_area', 'webpage_link', 'product_image', 'video_link', 'price_a_eur',
        'payment_reminder_days', 'stock_actual', 'location', 'specialist_contacts',
        'company_name', 'details', 'is_active', 'last_updated'
      ];
      rows = serviceRows;
    }

    const csv = [
      headers.join(','),
      ...rows.map(row => headers.map(h => `"${row[h as keyof typeof row] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kb_${kbType.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleBulkMediaUpload = () => {
    setShowBulkUploadModal(true);
  };

  const simulateCloudinaryUpload = () => {
    alert(language === 'EN'
      ? 'Cloudinary bulk upload simulated. In production, files would be uploaded and public URLs returned.'
      : 'Carga masiva a Cloudinary simulada. En producción, los archivos se subirían y se devolverían URLs públicas.');
    setShowBulkUploadModal(false);
  };

  const handleActivateKB = () => {
    setShowActivateModal(true);
  };

  const confirmActivation = () => {
    if (!selectedCompany) {
      alert(language === 'EN' ? 'Please select a company' : 'Por favor seleccione una empresa');
      return;
    }

    if (!kbName.trim()) {
      alert(language === 'EN' ? 'Please enter a KB name' : 'Por favor ingrese un nombre de KB');
      return;
    }

    const rows = kbType === 'Product' ? productRows : serviceRows;
    const mediaCount = rows.filter(r =>
      (kbType === 'Product' ? (r as ProductRow).product_image : (r as ServiceRow).product_image)
    ).length;

    const newEntry: KBRegistryEntry = {
      kb_id: `KB-${Date.now()}`,
      kb_name: kbName,
      kb_type: kbType,
      linked_company: selectedCompany,
      total_rows: rows.length,
      media_count: mediaCount,
      activated_at: new Date().toISOString(),
      status: 'Activated'
    };

    const updatedRegistry = [...registry, newEntry];
    setRegistry(updatedRegistry);
    localStorage.setItem('kb_registry', JSON.stringify(updatedRegistry));

    if (kbType === 'Product') {
      const activated = productRows.map(r => ({ ...r, is_active: true }));
      setProductRows(activated);
      localStorage.setItem('kb_product_rows', JSON.stringify(activated));
    } else {
      const activated = serviceRows.map(r => ({ ...r, is_active: true }));
      setServiceRows(activated);
      localStorage.setItem('kb_service_rows', JSON.stringify(activated));
    }

    setShowActivateModal(false);
    setKbName('');
  };

  const updateProductCell = (index: number, field: keyof ProductRow, value: any) => {
    const updated = [...productRows];
    updated[index] = { ...updated[index], [field]: value, last_updated: new Date().toISOString() };
    setProductRows(updated);
    localStorage.setItem('kb_product_rows', JSON.stringify(updated));
  };

  const updateServiceCell = (index: number, field: keyof ServiceRow, value: any) => {
    const updated = [...serviceRows];
    updated[index] = { ...updated[index], [field]: value, last_updated: new Date().toISOString() };
    setServiceRows(updated);
    localStorage.setItem('kb_service_rows', JSON.stringify(updated));
  };

  const currentRows = kbType === 'Product' ? productRows : serviceRows;

  return (
    <div style={{ padding: '24px', maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <button
          id="kb.back"
          data-nav="WINDOW_0"
          onClick={() => onNavigate && onNavigate('WINDOW_0')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            marginBottom: '16px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--glass-border)',
            borderRadius: '8px',
            color: 'var(--text-secondary)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            backdropFilter: 'blur(8px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)';
            e.currentTarget.style.color = 'var(--brand-cyan)';
            e.currentTarget.style.borderColor = 'var(--brand-cyan)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-secondary)';
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.borderColor = 'var(--glass-border)';
          }}
        >
          ← {language === 'EN' ? 'Back' : 'Volver'}
        </button>

        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {language === 'EN' ? 'Knowledge Base — Products & Services' : 'Base de Conocimientos — Productos y Servicios'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          {language === 'EN'
            ? 'Manage product and service data for AI training and customer interactions'
            : 'Gestiona datos de productos y servicios para entrenamiento IA e interacciones con clientes'}
        </p>
      </div>

      <div className="glass-card" style={{ padding: '20px', marginBottom: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px', minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>
              {language === 'EN' ? 'KB Type' : 'Tipo de KB'}
            </label>
            <div id="kb.typeToggle" style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '8px' }}>
              <button
                onClick={() => setKbType('Product')}
                style={{
                  padding: '8px 20px',
                  background: kbType === 'Product' ? 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  color: kbType === 'Product' ? '#FFFFFF' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                Product
              </button>
              <button
                onClick={() => setKbType('Service')}
                style={{
                  padding: '8px 20px',
                  background: kbType === 'Service' ? 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  color: kbType === 'Service' ? '#FFFFFF' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                Service
              </button>
            </div>
          </div>

          <div style={{ flex: '1 1 200px', minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>
              {language === 'EN' ? 'Company' : 'Empresa'}
            </label>
            <select
              id="kb.companySelector"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <option value="">{language === 'EN' ? 'Select Company' : 'Seleccionar Empresa'}</option>
              {filteredCompanies.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div id="kb-actions-wrapper" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', flex: '1 1 100%', width: '100%' }}>
            <button
              id="kb.importCsv"
              onClick={handleImportCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                flex: '1 1 auto',
                minWidth: '140px',
                justifyContent: 'center'
              }}
            >
              <Upload size={16} />
              {language === 'EN' ? 'Import CSV' : 'Importar CSV'}
            </button>

            <button
              id="kb.exportCsv"
              onClick={handleExportCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                flex: '1 1 auto',
                minWidth: '140px',
                justifyContent: 'center'
              }}
            >
              <Download size={16} />
              {language === 'EN' ? 'Export CSV' : 'Exportar CSV'}
            </button>

            <button
              id="kb.mediaUpload"
              onClick={handleBulkMediaUpload}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                flex: '1 1 auto',
                minWidth: '140px',
                justifyContent: 'center'
              }}
            >
              <ImageIcon size={16} />
              <span className="desktop-only">{language === 'EN' ? 'Bulk Media Upload' : 'Carga Masiva'}</span>
              <span className="mobile-only">{language === 'EN' ? 'Media' : 'Medios'}</span>
            </button>

            <button
              id="kb.activateAll"
              onClick={handleActivateKB}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 20px',
                background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                flex: '1 1 auto',
                minWidth: '140px',
                justifyContent: 'center'
              }}
            >
              <Check size={16} />
              {language === 'EN' ? 'Activate KB' : 'Activar KB'}
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '0', marginBottom: '24px', borderRadius: '16px', overflowX: 'auto' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
            DB {kbType} {language === 'EN' ? 'Hotel' : 'Hotel'}
          </h2>
          <button
            onClick={handleAddRow}
            style={{
              padding: '6px 12px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--brand-cyan)',
              borderRadius: '6px',
              color: 'var(--brand-cyan)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            + {language === 'EN' ? 'Add Row' : 'Añadir Fila'}
          </button>
        </div>

        {kbType === 'Product' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)' }}>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '120px', position: 'sticky', left: 0, background: 'var(--bg-secondary)', zIndex: 10 }}>Product No</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '200px' }}>Product Name</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '80px' }}>SKU</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '250px' }}>Description</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '100px' }}>Package Type</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '150px' }}>Cities</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '150px' }}>Webpage Link</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '150px' }}>Product Image</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '150px' }}>Video Link</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '90px' }}>Price €</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '110px' }}>Delivery €</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '120px' }}>Free Delivery €</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '80px' }}>Stock</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '120px' }}>Delivery Hours</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '130px' }}>Payment Reminder</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '200px' }}>Supplier Contact</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '200px' }}>Supplier Services</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '180px' }}>Warehouse Address</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '80px' }}>Active</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {productRows.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '8px', position: 'sticky', left: 0, background: 'var(--bg-primary)', zIndex: 5 }}>
                    <input value={row.product_no} onChange={(e) => updateProductCell(idx, 'product_no', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input value={row.product_name} onChange={(e) => updateProductCell(idx, 'product_name', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input value={row.sku} onChange={(e) => updateProductCell(idx, 'sku', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <textarea value={row.description} onChange={(e) => updateProductCell(idx, 'description', e.target.value)} rows={2} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input value={row.package_type} onChange={(e) => updateProductCell(idx, 'package_type', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input value={row.cities} onChange={(e) => updateProductCell(idx, 'cities', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input value={row.webpage_link} onChange={(e) => updateProductCell(idx, 'webpage_link', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {row.product_image && <img src={row.product_image} alt="" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }} />}
                      <input value={row.product_image} onChange={(e) => updateProductCell(idx, 'product_image', e.target.value)} style={{ flex: 1, padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                    </div>
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input value={row.video_link} onChange={(e) => updateProductCell(idx, 'video_link', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input type="number" value={row.price_a_eur} onChange={(e) => updateProductCell(idx, 'price_a_eur', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input type="number" value={row.delivery_price_eur} onChange={(e) => updateProductCell(idx, 'delivery_price_eur', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input type="number" value={row.sum_free_delivery_eur} onChange={(e) => updateProductCell(idx, 'sum_free_delivery_eur', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input type="number" value={row.stock_actual} onChange={(e) => updateProductCell(idx, 'stock_actual', parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input type="number" value={row.delivery_time_hours} onChange={(e) => updateProductCell(idx, 'delivery_time_hours', parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input type="number" value={row.payment_reminder_days} onChange={(e) => updateProductCell(idx, 'payment_reminder_days', parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input value={row.supplier_contact_details} onChange={(e) => updateProductCell(idx, 'supplier_contact_details', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input value={row.supplier_company_services} onChange={(e) => updateProductCell(idx, 'supplier_company_services', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input value={row.warehouse_physical_address} onChange={(e) => updateProductCell(idx, 'warehouse_physical_address', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input type="checkbox" checked={row.is_active} onChange={(e) => updateProductCell(idx, 'is_active', e.target.checked)} style={{ width: '16px', height: '16px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <button onClick={() => handleDeleteRow(idx)} style={{ padding: '4px 8px', background: 'rgba(255, 92, 92, 0.1)', border: '1px solid var(--danger-red)', borderRadius: '4px', color: 'var(--danger-red)', fontSize: '11px', cursor: 'pointer' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)' }}>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '120px', position: 'sticky', left: 0, background: 'var(--bg-secondary)', zIndex: 10 }}>Service No</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '200px' }}>Service Name</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '80px' }}>SKU</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '150px' }}>Subcategory</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '150px' }}>Category</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '80px' }}>Unit</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '100px' }}>Duration (h)</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '120px' }}>Format</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '250px' }}>Description</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '200px' }}>Included</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '200px' }}>Not Included</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '200px' }}>Guarantee</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '200px' }}>Not Guarantee</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '150px' }}>Suitable For</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '150px' }}>Not Suitable</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '100px' }}>Specialist</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '200px' }}>Specialist Area</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '150px' }}>Webpage Link</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '150px' }}>Product Image</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '150px' }}>Video Link</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '90px' }}>Price €</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '130px' }}>Payment Reminder</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '80px' }}>Stock</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '180px' }}>Location</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '180px' }}>Specialist Contact</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '180px' }}>Company Name</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '200px' }}>Details</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '80px' }}>Active</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {serviceRows.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '8px', position: 'sticky', left: 0, background: 'var(--bg-primary)', zIndex: 5 }}>
                    <input value={row.service_no} onChange={(e) => updateServiceCell(idx, 'service_no', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input value={row.service_name} onChange={(e) => updateServiceCell(idx, 'service_name', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input value={row.sku} onChange={(e) => updateServiceCell(idx, 'sku', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input value={row.service_subcategory} onChange={(e) => updateServiceCell(idx, 'service_subcategory', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input value={row.service_category} onChange={(e) => updateServiceCell(idx, 'service_category', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input value={row.unit} onChange={(e) => updateServiceCell(idx, 'unit', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input type="number" value={row.duration_hours} onChange={(e) => updateServiceCell(idx, 'duration_hours', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input value={row.format} onChange={(e) => updateServiceCell(idx, 'format', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <textarea value={row.description} onChange={(e) => updateServiceCell(idx, 'description', e.target.value)} rows={2} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <textarea value={row.included} onChange={(e) => updateServiceCell(idx, 'included', e.target.value)} rows={2} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <textarea value={row.not_included} onChange={(e) => updateServiceCell(idx, 'not_included', e.target.value)} rows={2} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <textarea value={row.what_guarantee} onChange={(e) => updateServiceCell(idx, 'what_guarantee', e.target.value)} rows={2} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <textarea value={row.what_not_guarantee} onChange={(e) => updateServiceCell(idx, 'what_not_guarantee', e.target.value)} rows={2} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input value={row.suitable_for} onChange={(e) => updateServiceCell(idx, 'suitable_for', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input value={row.not_suitable_for} onChange={(e) => updateServiceCell(idx, 'not_suitable_for', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input value={row.specialist_initials} onChange={(e) => updateServiceCell(idx, 'specialist_initials', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input value={row.specialist_area} onChange={(e) => updateServiceCell(idx, 'specialist_area', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input value={row.webpage_link} onChange={(e) => updateServiceCell(idx, 'webpage_link', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {row.product_image && <img src={row.product_image} alt="" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }} />}
                      <input value={row.product_image} onChange={(e) => updateServiceCell(idx, 'product_image', e.target.value)} style={{ flex: 1, padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                    </div>
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input value={row.video_link} onChange={(e) => updateServiceCell(idx, 'video_link', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input type="number" value={row.price_a_eur} onChange={(e) => updateServiceCell(idx, 'price_a_eur', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input type="number" value={row.payment_reminder_days} onChange={(e) => updateServiceCell(idx, 'payment_reminder_days', parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input type="number" value={row.stock_actual} onChange={(e) => updateServiceCell(idx, 'stock_actual', parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input value={row.location} onChange={(e) => updateServiceCell(idx, 'location', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input value={row.specialist_contacts} onChange={(e) => updateServiceCell(idx, 'specialist_contacts', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input value={row.company_name} onChange={(e) => updateServiceCell(idx, 'company_name', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <textarea value={row.details} onChange={(e) => updateServiceCell(idx, 'details', e.target.value)} rows={2} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input type="checkbox" checked={row.is_active} onChange={(e) => updateServiceCell(idx, 'is_active', e.target.checked)} style={{ width: '16px', height: '16px' }} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <button onClick={() => handleDeleteRow(idx)} style={{ padding: '4px 8px', background: 'rgba(255, 92, 92, 0.1)', border: '1px solid var(--danger-red)', borderRadius: '4px', color: 'var(--danger-red)', fontSize: '11px', cursor: 'pointer' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div id="kb.registry" className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={20} />
          {language === 'EN' ? 'KB Registry' : 'Registro de KB'}
        </h2>

        {registry.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontSize: '14px' }}>
            {language === 'EN' ? 'No activated KBs yet' : 'No hay KBs activados aún'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>KB ID</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>KB Name</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Type</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Company</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rows</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Media</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Activated</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {registry.map((entry) => (
                <tr key={entry.kb_id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '12px 8px', fontSize: '13px', color: 'var(--brand-cyan)', fontWeight: 600 }}>{entry.kb_id}</td>
                  <td style={{ padding: '12px 8px', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{entry.kb_name}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{
                      padding: '4px 8px',
                      background: entry.kb_type === 'Product' ? 'rgba(0, 212, 255, 0.1)' : 'rgba(132, 94, 247, 0.1)',
                      color: entry.kb_type === 'Product' ? 'var(--brand-cyan)' : '#845EF7',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600
                    }}>
                      {entry.kb_type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', fontSize: '13px', color: 'var(--text-secondary)' }}>{entry.linked_company}</td>
                  <td style={{ padding: '12px 8px', fontSize: '13px', color: 'var(--text-secondary)' }}>{entry.total_rows}</td>
                  <td style={{ padding: '12px 8px', fontSize: '13px', color: 'var(--text-secondary)' }}>{entry.media_count}</td>
                  <td style={{ padding: '12px 8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {new Date(entry.activated_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: entry.status === 'Activated' ? 'rgba(36, 211, 154, 0.1)' : entry.status === 'Tokens Missing' ? 'rgba(255, 209, 102, 0.1)' : 'rgba(255, 92, 92, 0.1)',
                      color: entry.status === 'Activated' ? 'var(--success-green)' : entry.status === 'Tokens Missing' ? 'var(--accent-yellow)' : 'var(--danger-red)'
                    }}>
                      {entry.status === 'Activated' ? <Check size={12} /> : entry.status === 'Tokens Missing' ? <AlertCircle size={12} /> : <X size={12} />}
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showImportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }} onClick={() => setShowImportModal(false)}>
          <div className="glass-card" style={{ padding: '32px', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
              {language === 'EN' ? 'CSV Import - Mapping Preview' : 'Importar CSV - Vista Previa de Mapeo'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '13px' }}>
              {language === 'EN'
                ? `Found ${csvData.length} rows with ${csvHeaders.length} columns. Verify mapping below and confirm import.`
                : `Se encontraron ${csvData.length} filas con ${csvHeaders.length} columnas. Verifique el mapeo y confirme la importación.`}
            </p>
            <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', marginBottom: '20px', maxHeight: '300px', overflowY: 'auto' }}>
              <div style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                <strong>{language === 'EN' ? 'Detected columns:' : 'Columnas detectadas:'}</strong><br />
                {csvHeaders.join(', ')}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowImportModal(false); setCsvData([]); setCsvHeaders([]); }}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                {language === 'EN' ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                onClick={confirmImport}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {language === 'EN' ? 'Confirm Import' : 'Confirmar Importación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowBulkUploadModal(false)}>
          <div className="glass-card" style={{ padding: '32px', maxWidth: '500px', width: '90%', borderRadius: '16px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
              {language === 'EN' ? 'Bulk Media Upload (Cloudinary)' : 'Carga Masiva de Medios (Cloudinary)'}
            </h3>
            <div style={{
              padding: '60px 20px',
              border: '2px dashed var(--glass-border)',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              <ImageIcon size={40} style={{ color: 'var(--brand-cyan)', marginBottom: '12px' }} />
              <p style={{ color: 'var(--text-primary)', fontSize: '14px', marginBottom: '8px' }}>
                {language === 'EN' ? 'Drag and drop images/videos or click to browse' : 'Arrastra imágenes/videos o haz clic para buscar'}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                {language === 'EN' ? 'Files will be uploaded to Cloudinary and URLs returned' : 'Los archivos se subirán a Cloudinary y se devolverán URLs'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowBulkUploadModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                {language === 'EN' ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                onClick={simulateCloudinaryUpload}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {language === 'EN' ? 'Upload to Cloudinary' : 'Subir a Cloudinary'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showActivateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowActivateModal(false)}>
          <div className="glass-card" style={{ padding: '32px', maxWidth: '500px', width: '90%', borderRadius: '16px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
              {language === 'EN' ? 'Activate Knowledge Base' : 'Activar Base de Conocimientos'}
            </h3>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                {language === 'EN' ? 'KB Name' : 'Nombre de KB'}
              </label>
              <input
                type="text"
                value={kbName}
                onChange={(e) => setKbName(e.target.value)}
                placeholder={language === 'EN' ? 'Enter KB name' : 'Ingrese nombre de KB'}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                <strong>{language === 'EN' ? 'Type:' : 'Tipo:'}</strong> {kbType}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                <strong>{language === 'EN' ? 'Company:' : 'Empresa:'}</strong> {selectedCompany || (language === 'EN' ? 'None selected' : 'Ninguna seleccionada')}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                <strong>{language === 'EN' ? 'Total Rows:' : 'Total de Filas:'}</strong> {currentRows.length}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowActivateModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                {language === 'EN' ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                onClick={confirmActivation}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {language === 'EN' ? 'Activate' : 'Activar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
