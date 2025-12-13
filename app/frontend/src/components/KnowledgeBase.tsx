import React, { useState, useEffect, useRef } from 'react';
import { Upload, Download, Image as ImageIcon, Play, Database, X, AlertCircle, Images, Copy, Trash2 } from 'lucide-react';

interface KnowledgeBaseProps {
  language: string;
  onNavigate?: (window: string) => void;
}

interface ProductRow {
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
  product_name: string;
  sku: string;
  service_subcategory: string;
  service_category: string;
  unit: string;
  duration: string;
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

interface MediaItem {
  public_id: string;
  url: string;
  resource_type: 'image' | 'video';
}


export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ language, onNavigate }) => {
  const [kbType, setKbType] = useState<'Product' | 'Service'>('Product');
  // const [selectedCompany, setSelectedCompany] = useState<string>(() => {
  //   return localStorage.getItem('kb_selected_company') || '';
  // });
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [productRows, setProductRows] = useState<ProductRow[]>([]);
  const [serviceRows, setServiceRows] = useState<ServiceRow[]>([]);
  const [registry, setRegistry] = useState<KBRegistryEntry[]>([]);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoadingMediaGallery, setIsLoadingMediaGallery] = useState(false);
  const [mediaGalleryError, setMediaGalleryError] = useState<string | null>(null);
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isLoadingRegistry, setIsLoadingRegistry] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [productCompanyName, setProductCompanyName] = useState<string | null>(null);
  const [serviceCompanyName, setServiceCompanyName] = useState<string | null>(null);

  const getNoCompanyAlert = () => {
    if (language === 'EN') {
      return kbType === 'Product'
        ? 'Please create a Product company first in Company Setup.'
        : 'Please create a Service company first in Company Setup.';
    }

    return kbType === 'Product'
      ? 'Por favor crea primero una empresa de tipo Producto en Configuración de Empresa.'
      : 'Por favor crea primero una empresa de tipo Servicio en Configuración de Empresa.';
  };


  const fetchKBRegistry = async () => {
    setIsLoadingRegistry(true);
    try {
      const token = localStorage.getItem('access_token');
      const url = selectedCompany
        ? `http://localhost:8000/api/v1/knowledge-base/list?company_name=${encodeURIComponent(selectedCompany)}`
        : 'http://localhost:8000/api/v1/knowledge-base/list';

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.ok && result.knowledge_bases) {
        // Transform backend data to registry format
        // Only show KBs that have data (row_count > 0)
        const transformedRegistry: KBRegistryEntry[] = result.knowledge_bases
          .filter((kb: any) => (kb.row_count || 0) > 0)  // Only show activated KBs with data
          .map((kb: any) => ({
            kb_id: kb.table_name,
            kb_name: kb.table_name,
            kb_type: kb.kb_type,
            linked_company: kb.company_name,
            total_rows: kb.row_count || 0,
            media_count: 0,
            activated_at: kb.created_at,
            status: (kb.row_count || 0) > 0 ? 'Activated' : 'Tokens Missing'
          }));

        setRegistry(transformedRegistry);
      } else {
        throw new Error(result.detail || 'Failed to fetch KB registry');
      }
    } catch (error: any) {
      console.error('Failed to fetch KB registry:', error);
      alert(language === 'EN'
        ? `Failed to load knowledge bases: ${error.message}`
        : `Error al cargar bases de conocimiento: ${error.message}`
      );
    } finally {
      setIsLoadingRegistry(false);
    }
  };

  const fetchKBData = async (tableName: string) => {
    setIsLoadingData(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `http://localhost:8000/api/v1/knowledge-base/data/${tableName}?limit=100`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const result = await response.json();

      if (response.ok && result.data) {
        // Set the rows based on KB type
        const kbEntry = registry.find(r => r.kb_id === tableName);
        if (kbEntry) {
          if (kbEntry.kb_type === 'Product') {
            setProductRows(result.data);
          } else {
            setServiceRows(result.data);
          }
        }
      } else {
        throw new Error(result.detail || 'Failed to fetch KB data');
      }
    } catch (error: any) {
      console.error('Failed to fetch KB data:', error);
      alert(language === 'EN'
        ? `Failed to load data: ${error.message}`
        : `Error al cargar datos: ${error.message}`
      );
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    // Fetch companies from backend API
    fetchCompaniesFromAPI();

    // Fetch KB registry from backend on component mount
    fetchKBRegistry();
  }, []);

  const fetchCompaniesFromAPI = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${API_URL}/api/v1/companies`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const mappedCompanies = data.map((c: any) => ({
          name: c.name,
          type: c.company_type || (c.product_type === 'Product' ? 'product' : 'service')
        }));

        setCompanies(mappedCompanies);

        const productCompany = mappedCompanies.find((c: Company) => c.type === 'product');
        const serviceCompany = mappedCompanies.find((c: Company) => c.type === 'service');

        setProductCompanyName(productCompany ? productCompany.name : null);
        setServiceCompanyName(serviceCompany ? serviceCompany.name : null);

        localStorage.setItem('companies', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Failed to fetch companies from API:', error);

      const storedCompanies = localStorage.getItem('companies');
      if (storedCompanies) {
        const companiesData = JSON.parse(storedCompanies);
        const mappedCompanies = companiesData.map((c: any) => ({
          name: c.name,
          type: c.type || c.company_type || 'product'
        }));
        setCompanies(mappedCompanies);

        const productCompany = mappedCompanies.find((c: Company) => c.type === 'product');
        const serviceCompany = mappedCompanies.find((c: Company) => c.type === 'service');

        setProductCompanyName(productCompany ? productCompany.name : null);
        setServiceCompanyName(serviceCompany ? serviceCompany.name : null);
      }
    }
  };

  // Fetch KB registry when selectedCompany changes
  useEffect(() => {
    fetchKBRegistry();
  }, [selectedCompany]);

  useEffect(() => {
    if (kbType === 'Product' || kbType.toLowerCase() === 'product') {
      setSelectedCompany(productCompanyName || '');
    } else {
      setSelectedCompany(serviceCompanyName || '');
    }
  }, [kbType, productCompanyName, serviceCompanyName]);


  // Fetch KB data when registry updates or company changes
  useEffect(() => {
    if (selectedCompany && registry.length > 0) {
      const companyKBs = registry.filter(r => r.linked_company === selectedCompany);

      if (companyKBs.length > 0) {
        // Auto-select KB type based on what exists
        // If both Product and Service exist, prefer Service (as specified)
        const hasService = companyKBs.some(kb => kb.kb_type === 'Service');
        const hasProduct = companyKBs.some(kb => kb.kb_type === 'Product');

        if (hasService && hasProduct) {
          // Both exist, default to Service
          setKbType('Service');
        } else if (hasService) {
          setKbType('Service');
        } else if (hasProduct) {
          setKbType('Product');
        }

        // Fetch data for each KB type if it exists
        companyKBs.forEach(kb => {
          fetchKBData(kb.kb_id);
        });
      }
    }
  }, [registry, selectedCompany]);

  // const filteredCompanies = companies.filter(c =>
  //   kbType === 'Product' ? c.type === 'product' : c.type === 'service'
  // );

  const handleAddRow = async () => {
    if (!selectedCompany) {
      alert(getNoCompanyAlert());
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const tableName = `DB ${kbType} ${selectedCompany}`;

      const newRow = kbType === 'Product' ? {
        product_name: 'New Product',
        sku: '',
        description: '',
        unit: '',
        website_url: '',
        image_url: '',
        video_url: '',
        price_eur: null,
        logistics_price_eur: null,
        free_delivery: null,
        stock_units: null,
        delivery_time_hours: null,
        payment_reminder: null,
        supplier_contact: '',
        supplier_company_services: '',
        warehouse_address: '',
        cities: []
      } : {
        product_name: 'New Service',
        sku: '',
        service_subcategory: '',
        service_category: '',
        unit: '',
        duration: null,
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
        website_url: '',
        image_url: '',
        video_url: '',
        price_eur: null,
        payment_reminder: null,
        stock_units: null,
        location: '',
        specialist_contacts: '',
        company: '',
        details: ''
      };

      const response = await fetch(`${API_URL}/api/v1/knowledge-base/row/${encodeURIComponent(tableName)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRow)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to add row');
      }

      // Refresh data
      await fetchKBData(tableName);

    } catch (error: any) {
      console.error('Failed to add row:', error);
      alert(language === 'EN' ? `Failed to add row: ${error.message}` : `Error al añadir fila: ${error.message}`);
    }
  };

  const handleDeleteRow = async (index: number) => {
    if (!selectedCompany) return;

    const currentRow = kbType === 'Product' ? productRows[index] : serviceRows[index];
    if (!currentRow || !(currentRow as any).id) {
      alert(language === 'EN' ? 'Cannot delete row without ID' : 'No se puede eliminar fila sin ID');
      return;
    }

    if (!confirm(language === 'EN' ? 'Are you sure you want to delete this row?' : '¿Estás seguro de que quieres eliminar esta fila?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const tableName = `DB ${kbType} ${selectedCompany}`;
      const rowId = (currentRow as any).id;

      const response = await fetch(`${API_URL}/api/v1/knowledge-base/row/${encodeURIComponent(tableName)}/${rowId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete row');
      }

      // Refresh data
      await fetchKBData(tableName);

    } catch (error: any) {
      console.error('Failed to delete row:', error);
      alert(language === 'EN' ? `Failed to delete row: ${error.message}` : `Error al eliminar fila: ${error.message}`);
    }
  };

  const handleImportCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        // Don't parse CSV in frontend - just upload the raw file to backend
        // Backend will handle encoding, delimiters, quotes, etc. properly
        await uploadCSVFile(file);
      }
    };
    input.click();
  };

  const uploadCSVFile = async (file: File) => {
    if (!selectedCompany) {
      alert(getNoCompanyAlert());
      return;
    }

    try {
      // Create FormData with the raw file - backend will parse it
      const formData = new FormData();
      formData.append('file', file);
      formData.append('company_name', selectedCompany);
      formData.append('kb_type', kbType);

      // Get auth token
      const token = localStorage.getItem('access_token');

      // Upload to backend
      const response = await fetch('http://localhost:8000/api/v1/knowledge-base/upload-csv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Upload failed');
      }

      alert(language === 'EN'
        ? `Knowledge base uploaded successfully! ${result.rows_imported} rows imported.`
        : `¡Base de conocimiento cargada exitosamente! ${result.rows_imported} filas importadas.`
      );

      // Refresh the registry
      await fetchKBRegistry();

    } catch (error: any) {
      alert(language === 'EN'
        ? `Failed to upload: ${error.message}`
        : `Error al cargar: ${error.message}`
      );
    }
  };

  const handleExportCSV = () => {
    let headers: string[];
    let rows: any[];

    if (kbType === 'Product') {
      headers = [
        'product_name', 'sku', 'description', 'package_type', 'cities',
        'webpage_link', 'product_image', 'video_link', 'price_a_eur', 'delivery_price_eur',
        'sum_free_delivery_eur', 'stock_actual', 'delivery_time_hours', 'payment_reminder_days',
        'supplier_contact_details', 'supplier_company_services', 'warehouse_physical_address'
      ];
      rows = productRows;
    } else {
      headers = [
        'product_name', 'sku', 'service_subcategory', 'service_category', 'unit',
        'duration', 'format', 'description', 'included', 'not_included', 'what_guarantee',
        'what_not_guarantee', 'suitable_for', 'not_suitable_for', 'specialist_initials',
        'specialist_area', 'webpage_link', 'product_image', 'video_link', 'price_a_eur',
        'payment_reminder_days', 'stock_actual', 'location', 'specialist_contacts',
        'company_name', 'details'
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
    // wipe the previous choice
    setBulkFiles([]);
    setMediaError(null);
    setShowBulkUploadModal(true);
  };

  const handleMediaFilesSelected = (files: File[]) => {
    if (!files.length) return;

    const images = files.filter(f => f.type.startsWith('image/'));
    const videos = files.filter(f => f.type.startsWith('video/'));

    // уже выбранные видео + новые
    const alreadyHasVideo = bulkFiles.some(f => f.type.startsWith('video/'));
    if (videos.length + (alreadyHasVideo ? 1 : 0) > 1) {
      setMediaError(
        language === 'EN'
          ? 'You can upload only one video for this folder.'
          : 'Solo se permite un vídeo por carpeta.'
      );
      return;
    }

    setBulkFiles(prev => [...prev, ...images, ...videos]);
    setMediaError(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    handleMediaFilesSelected(files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleMediaFilesSelected(files);
    // чтобы можно было выбрать тот же файл ещё раз
    e.target.value = '';
  };

  const uploadBulkMedia = async () => {
    if (!selectedCompany) {
      alert(getNoCompanyAlert());
      return;
    }

    if (bulkFiles.length === 0) {
      alert(language === 'EN'
        ? 'Please add at least one file'
        : 'Por favor añade al menos un archivo'
      );
      return;
    }

    try {
      setIsUploadingMedia(true);
      const token = localStorage.getItem('access_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

      const formData = new FormData();
      bulkFiles.forEach(f => formData.append('files', f));
      formData.append('kb_type', kbType);           // "Product" | "Service"
      formData.append('company_name', selectedCompany);

      const res = await fetch(`${API_URL}/api/v1/knowledge-base/media-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.detail || 'Upload failed');
      }

      // здесь result.items = [{ url, resource_type, public_id, filename }, ...]
      console.log('Uploaded media:', result);

      alert(
        language === 'EN'
          ? `Uploaded ${result.items.length} file(s) to Cloudinary.`
          : `Se han subido ${result.items.length} archivo(s) a Cloudinary.`
      );

      setShowBulkUploadModal(false);
      setBulkFiles([]);
    } catch (err: any) {
      console.error(err);
      setMediaError(
        language === 'EN'
          ? `Upload failed: ${err.message}`
          : `Error al subir: ${err.message}`
      );
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleOpenMediaGallery = async () => {
    if (!selectedCompany) {
      // Логика такая же, как при аплоаде CSV / медиа
      alert(getNoCompanyAlert());
      return;
    }

    try {
      setShowMediaGallery(true);
      setIsLoadingMediaGallery(true);
      setMediaGalleryError(null);

      const token = localStorage.getItem('access_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

      const res = await fetch(
        `${API_URL}/api/v1/cloudinary/media?kb_type=${encodeURIComponent(kbType)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.detail || 'Failed to load media');
      }

      const items: MediaItem[] = [
        ...(data.images || []),
        ...(data.videos || []),
      ];

      setMediaItems(items);
    } catch (err: any) {
      console.error('Failed to load media gallery:', err);
      setMediaGalleryError(err.message || 'Failed to load media');
      alert(
        language === 'EN'
          ? `Failed to load media: ${err.message}`
          : `Error al cargar medios: ${err.message}`
      );
    } finally {
      setIsLoadingMediaGallery(false);
    }
  };

  const handleCopyMediaUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      // alert(
      //   language === 'EN' ? 'Link copied to clipboard' : 'Enlace copiado al portapapeles'
      // );
    } catch (err) {
      console.error('Clipboard error:', err);
      alert(
        language === 'EN'
          ? 'Failed to copy link'
          : 'Error al copiar el enlace'
      );
    }
  };

  const handleDeleteMedia = async (publicId: string) => {
    const confirmTextEN = 'Are you sure you want to delete this file from Cloudinary?';
    const confirmTextES = '¿Seguro que quieres eliminar este archivo de Cloudinary?';

    if (!confirm(language === 'EN' ? confirmTextEN : confirmTextES)) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

      const res = await fetch(
        `${API_URL}/api/v1/cloudinary/media/${encodeURIComponent(publicId)}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.detail || 'Failed to delete media');
      }

      // Убираем удалённый элемент из стейта
      setMediaItems(prev => prev.filter(item => item.public_id !== publicId));
    } catch (err: any) {
      console.error('Failed to delete media:', err);
      alert(
        language === 'EN'
          ? `Failed to delete media: ${err.message}`
          : `Error al eliminar medio: ${err.message}`
      );
    }
  };

  

  const updateProductCell = async (index: number, field: keyof ProductRow, value: any) => {
    if (!selectedCompany) return;

    // Optimistically update local state for responsive UI
    const updated = [...productRows];
    updated[index] = { ...updated[index], [field]: value, last_updated: new Date().toISOString() };
    setProductRows(updated);

    // Get the row ID and table name
    const currentRow = productRows[index];
    if (!currentRow || !(currentRow as any).id) {
      console.error('Cannot update row without ID');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const tableName = `DB ${kbType} ${selectedCompany}`;
      const rowId = (currentRow as any).id;

      // Prepare update payload with only the changed field
      const updatePayload = {
        [field]: value
      };

      const response = await fetch(`${API_URL}/api/v1/knowledge-base/row/${encodeURIComponent(tableName)}/${rowId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update cell');
      }

      // Backend updated successfully
      console.log(`Updated ${field} for row ${rowId}`);

    } catch (error: any) {
      console.error('Failed to update cell:', error);
      // Optionally revert local state or show error to user
      alert(language === 'EN' ? `Failed to save changes: ${error.message}` : `Error al guardar cambios: ${error.message}`);
      // Refresh data to get the correct state from backend
      await fetchKBData(`${selectedCompany} ${kbType}`);
    }
  };

  const updateServiceCell = async (index: number, field: keyof ServiceRow, value: any) => {
    if (!selectedCompany) return;

    // Optimistically update local state for responsive UI
    const updated = [...serviceRows];
    updated[index] = { ...updated[index], [field]: value, last_updated: new Date().toISOString() };
    setServiceRows(updated);

    // Get the row ID and table name
    const currentRow = serviceRows[index];
    if (!currentRow || !(currentRow as any).id) {
      console.error('Cannot update row without ID');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const tableName = `DB ${kbType} ${selectedCompany}`;
      const rowId = (currentRow as any).id;

      // Prepare update payload with only the changed field
      const updatePayload = {
        [field]: value
      };

      const response = await fetch(`${API_URL}/api/v1/knowledge-base/row/${encodeURIComponent(tableName)}/${rowId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update cell');
      }

      // Backend updated successfully
      console.log(`Updated ${field} for row ${rowId}`);

    } catch (error: any) {
      console.error('Failed to update cell:', error);
      // Optionally revert local state or show error to user
      alert(language === 'EN' ? `Failed to save changes: ${error.message}` : `Error al guardar cambios: ${error.message}`);
      // Refresh data to get the correct state from backend
      await fetchKBData(`${selectedCompany} ${kbType}`);
    }
  };

  const currentRows = kbType === 'Product' ? productRows : serviceRows;

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
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
          <div style={{ flex: '0 0 220px', minWidth: '200px' }}>
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
              id="kb.mediaGallery"
              onClick={handleOpenMediaGallery}
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
                flex: '0 0 auto',
                minWidth: '120px',
                justifyContent: 'center',
              }}
            >
              <Images size={16} />
              <span className="desktop-only">
                {language === 'EN' ? 'Media Gallery' : 'Galería'}
              </span>
              <span className="mobile-only">
                {language === 'EN' ? 'Gallery' : 'Galería'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading indicators */}
      {(isLoadingRegistry || isLoadingData) && (
        <div className="glass-card" style={{ padding: '32px', marginBottom: '24px', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '3px solid rgba(0, 212, 255, 0.1)',
            borderTop: '3px solid var(--brand-cyan)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px'
          }}></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {isLoadingRegistry
              ? (language === 'EN' ? 'Loading knowledge bases...' : 'Cargando bases de conocimiento...')
              : (language === 'EN' ? 'Loading data...' : 'Cargando datos...')
            }
          </p>
        </div>
      )}

      {/* Display message when no KB exists for selected company */}
      {!isLoadingRegistry && !isLoadingData && selectedCompany && registry.filter(r => r.linked_company === selectedCompany).length === 0 && (
        <div className="glass-card" style={{ padding: '32px', marginBottom: '24px', borderRadius: '16px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
            {language === 'EN'
              ? `No knowledge base found for ${selectedCompany}. Upload a CSV to create one.`
              : `No se encontró base de conocimiento para ${selectedCompany}. Sube un CSV para crear una.`
            }
          </p>
        </div>
      )}

      {/* Display registry summary */}
      {!isLoadingRegistry && registry.length > 0 && (
        <div className="glass-card" style={{ padding: '20px', marginBottom: '24px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
            {language === 'EN' ? 'Knowledge Base Registry' : 'Registro de Bases de Conocimiento'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {registry.map((entry) => (
              <div key={entry.kb_id} style={{
                padding: '12px',
                background: 'var(--bg-secondary)',
                borderRadius: '8px',
                border: '1px solid var(--glass-border)'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand-cyan)', marginBottom: '4px' }}>
                  {entry.kb_type}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  {entry.linked_company}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {entry.total_rows} {language === 'EN' ? 'rows' : 'filas'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editable Data Table */}
      {currentRows.length > 0 && (
        <div className="glass-card" style={{ padding: '0', marginBottom: '24px', borderRadius: '16px', overflowX: 'auto' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', left: 0, background: 'var(--bg-primary)', zIndex: 15 }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {selectedCompany ? `${selectedCompany} - ${kbType}` : `DB ${kbType}`}
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
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              + {language === 'EN' ? 'Add Row' : 'Añadir Fila'}
            </button>
          </div>

        {kbType === 'Product' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)' }}>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '200px', position: 'sticky', left: 0, background: 'var(--bg-secondary)', zIndex: 10 }}>Product Name</th>
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
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '200px', position: 'sticky', left: 0, background: 'var(--bg-secondary)', zIndex: 10 }}>Service Name</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '80px' }}>SKU</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '150px' }}>Subcategory</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '150px' }}>Category</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '80px' }}>Unit</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '150px' }}>Duration</th>
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
                    <input value={row.product_name} onChange={(e) => updateServiceCell(idx, 'product_name', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
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
                    <input value={row.duration} onChange={(e) => updateServiceCell(idx, 'duration', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
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
)}

      {showBulkUploadModal && (
        <div
          style={{
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
          }}
          onClick={() => setShowBulkUploadModal(false)}
        >
          <div
            className="glass-card"
            style={{ padding: '32px', maxWidth: '500px', width: '90%', borderRadius: '16px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontSize: '20px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '16px'
              }}
            >
              {language === 'EN'
                ? 'Bulk Media Upload (Cloudinary)'
                : 'Carga Masiva de Medios (Cloudinary)'}
            </h3>

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleBrowseClick}
              style={{
                padding: '60px 20px',
                border: '2px dashed var(--glass-border)',
                borderRadius: '8px',
                textAlign: 'center',
                marginBottom: '16px',
                cursor: 'pointer',
                background: isDragging
                  ? 'rgba(0, 212, 255, 0.06)'
                  : 'transparent'
              }}
            >
              <ImageIcon
                size={40}
                style={{ color: 'var(--brand-cyan)', marginBottom: '12px' }}
              />
              <p
                style={{
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  marginBottom: '8px'
                }}
              >
                {language === 'EN'
                  ? 'Drag and drop images/videos or click to browse'
                  : 'Arrastra imágenes/videos o haz clic para buscar'}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                {language === 'EN'
                  ? 'You can upload many images but only one video per folder.'
                  : 'Puedes subir muchas imágenes pero solo un vídeo por carpeta.'}
              </p>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                style={{ display: 'none' }}
                onChange={handleFileInputChange}
              />

              {bulkFiles.length > 0 && (
                <div style={{ marginTop: '16px', textAlign: 'left' }}>
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      marginBottom: '4px'
                    }}
                  >
                    {language === 'EN'
                      ? 'Files selected:'
                      : 'Archivos seleccionados:'}
                  </p>
                  <ul
                    style={{
                      maxHeight: '120px',
                      overflowY: 'auto',
                      fontSize: '11px',
                      paddingLeft: '18px',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {bulkFiles.map(f => (
                      <li key={f.name + f.lastModified}>{f.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              {mediaError && (
                <p
                  style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    color: 'var(--danger-red)'
                  }}
                >
                  {mediaError}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowBulkUploadModal(false);
                  setBulkFiles([]);
                  setMediaError(null);
                }}
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
                onClick={uploadBulkMedia}
                disabled={isUploadingMedia || bulkFiles.length === 0}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
                  opacity: isUploadingMedia || bulkFiles.length === 0 ? 0.6 : 1,
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  cursor: isUploadingMedia || bulkFiles.length === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                {isUploadingMedia
                  ? language === 'EN'
                    ? 'Uploading...'
                    : 'Subiendo...'
                  : language === 'EN'
                    ? 'Upload to Cloudinary'
                    : 'Subir a Cloudinary'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showMediaGallery && (
        <div
          style={{
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
          }}
          onClick={() => setShowMediaGallery(false)}
        >
          <div
            className="glass-card"
            style={{ padding: '24px', maxWidth: '800px', width: '95%', borderRadius: '16px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                {language === 'EN'
                  ? `Media Gallery — ${kbType}`
                  : `Galería de Medios — ${kbType}`}
              </h3>
              <button
                onClick={() => setShowMediaGallery(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {isLoadingMediaGallery && (
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <div
                  style={{
                    display: 'inline-block',
                    width: '32px',
                    height: '32px',
                    border: '3px solid rgba(0, 212, 255, 0.1)',
                    borderTop: '3px solid var(--brand-cyan)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '12px',
                  }}
                />
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {language === 'EN' ? 'Loading media...' : 'Cargando medios...'}
                </p>
              </div>
            )}

            {!isLoadingMediaGallery && mediaItems.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {language === 'EN'
                    ? 'No media found for this knowledge base type yet.'
                    : 'Todavía no hay medios para este tipo de base de conocimiento.'}
                </p>
              </div>
            )}

            {!isLoadingMediaGallery && mediaItems.length > 0 && (
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  paddingRight: '4px',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: '12px',
                  }}
                >
                  {mediaItems.map(item => (
                    <div
                      key={item.public_id}
                      style={{
                        position: 'relative',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--glass-border)',
                      }}
                    >
                      {item.resource_type === 'image' ? (
                        <img
                          src={item.url}
                          alt=""
                          style={{
                            width: '100%',
                            height: '110px',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '110px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                          }}
                        >
                          <video
                            src={item.url}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                            muted
                          />
                          <Play
                            size={28}
                            style={{
                              position: 'absolute',
                              color: '#FFFFFF',
                              opacity: 0.9,
                            }}
                          />
                        </div>
                      )}

                      <div
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          display: 'flex',
                          gap: '4px',
                        }}
                      >
                        <button
                          onClick={() => handleCopyMediaUrl(item.url)}
                          style={{
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px',
                            background: 'rgba(0, 0, 0, 0.5)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title={language === 'EN' ? 'Copy public URL' : 'Copiar URL pública'}
                        >
                          <Copy size={14} color="#FFFFFF" />
                        </button>
                        <button
                          onClick={() => handleDeleteMedia(item.public_id)}
                          style={{
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px',
                            background: 'rgba(220, 38, 38, 0.8)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title={language === 'EN' ? 'Delete from Cloudinary' : 'Eliminar de Cloudinary'}
                        >
                          <Trash2 size={14} color="#FFFFFF" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mediaGalleryError && (
              <p
                style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: 'var(--danger-red)',
                }}
              >
                {mediaGalleryError}
              </p>
            )}

            <div style={{ marginTop: '16px', textAlign: 'right' }}>
              <button
                onClick={() => setShowMediaGallery(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {language === 'EN' ? 'Close' : 'Cerrar'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};
