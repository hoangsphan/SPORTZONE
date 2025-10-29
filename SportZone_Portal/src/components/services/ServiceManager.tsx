/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import Swal from 'sweetalert2';
import Sidebar from '../../Sidebar';
type Service = {
    id: number;
    name: string;
    description: string;
    price: number;
    status: boolean;
};

const ServiceManager: React.FC = () => {
    const [services, setServices] = useState<Service[]>([
        { id: 1, name: 'Dọn dẹp sân', description: 'Dọn dẹp sân sau khi sử dụng', price: 200000, status: true },
        { id: 2, name: 'Thuê đèn chiếu sáng', description: 'Cung cấp đèn chiếu sáng cho sân', price: 150000, status: false },
    ]);

    const [filteredServices, setFilteredServices] = useState<Service[]>(services);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [editId, setEditId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);
    const [formData, setFormData] = useState<Omit<Service, 'id'>>({
        name: '',
        description: '',
        price: 0,
        status: true,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: type,
            title: message,
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true,
        });
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const target = e.target as HTMLInputElement | HTMLTextAreaElement;
        const { name, value, type } = target;

        let val: string | number | boolean;
        if (type === 'checkbox') {
            val = (target as HTMLInputElement).checked;
        } else if (type === 'number') {
            val = Number(value);
        } else {
            val = value;
        }
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.description || !formData.price) {
            showToast('Vui lòng điền đầy đủ thông tin bắt buộc!', 'error');
            return;
        }

        if (editId !== null) {
            setServices(prev => prev.map(s => (s.id === editId ? { ...s, ...formData } : s)));
            setFilteredServices(prev => prev.map(s => (s.id === editId ? { ...s, ...formData } : s)));
            showToast('Cập nhật dịch vụ thành công!');
        } else {
            const newService: Service = {
                id: services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1,
                ...formData,
            };
            setServices(prev => [...prev, newService]);
            setFilteredServices(prev => [...prev, newService]);
            showToast('Thêm dịch vụ thành công!');
        }

        resetForm();
    };

    const handleEdit = (id: number) => {
        const target = services.find(s => s.id === id);
        if (target) {
            const { id: _, ...rest } = target;
            setFormData(rest);
            setEditId(id);
            setShowModal(true);
        }
    };

    const handleDelete = () => {
        if (serviceToDelete === null) return;

        setServices(prev => prev.filter(s => s.id !== serviceToDelete));
        setFilteredServices(prev => prev.filter(s => s.id !== serviceToDelete));
        showToast('Xóa dịch vụ thành công!', 'success');

        const totalPages = Math.ceil(filteredServices.length / pageSize);
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }

        setShowDeleteModal(false);
        setServiceToDelete(null);
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', price: 0, status: true });
        setEditId(null);
        setShowModal(false);
    };

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value.toLowerCase();
        setSearchKeyword(searchTerm);
        setCurrentPage(1);

        if (searchTerm.trim() === '') {
            setFilteredServices(services);
        } else {
            setFilteredServices(
                services.filter(s =>
                    s.name.toLowerCase().includes(searchTerm) ||
                    s.description.toLowerCase().includes(searchTerm) ||
                    s.status.toString().includes(searchTerm)
                )
            );
        }
    };

    const goToPage = (page: number) => setCurrentPage(page);
    const goToPrevPage = () => currentPage > 1 && setCurrentPage(prev => prev - 1);
    const goToNextPage = () => {
        const totalPages = Math.ceil(filteredServices.length / pageSize);
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };
    const changePageSize = (e: ChangeEvent<HTMLSelectElement>) => {
        setPageSize(parseInt(e.target.value));
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(filteredServices.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredServices.length);
    const currentServices = filteredServices.slice(startIndex, endIndex);

    const renderPaginationNumbers = () => {
        const pageNumbers = [];
        let startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, startPage + 4);

        if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

        if (startPage > 1) {
            pageNumbers.push(<button key={1} className="px-4 py-2 border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50" onClick={() => goToPage(1)}>1</button>);
            if (startPage > 2) pageNumbers.push(<span key="ellipsis-start" className="px-4 py-2 border border-gray-300 bg-white text-sm text-gray-700">...</span>);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    className={`px-4 py-2 border text-sm ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                    onClick={() => goToPage(i)}
                    disabled={i === currentPage}
                >
                    {i}
                </button>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) pageNumbers.push(<span key="ellipsis-end" className="px-4 py-2 border border-gray-300 bg-white text-sm text-gray-700">...</span>);
            pageNumbers.push(<button key={totalPages} className="px-4 py-2 border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50" onClick={() => goToPage(totalPages)}>{totalPages}</button>);
        }

        return pageNumbers;
    };

    return (
        <>
            <Sidebar />
            <div className="min-h-screen flex flex-col bg-gray-50 pl-64 pt-16">
                <header className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-semibold text-gray-900">Quản lý Dịch vụ</h1>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    🔍
                                </div>
                                <input
                                    type="text"
                                    id="search-input"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md pl-10 pr-4 py-2 focus:ring-blue-600 focus:border-blue-600 block w-64"
                                    placeholder="Tìm kiếm dịch vụ..."
                                    value={searchKeyword}
                                    onChange={handleSearch}
                                />
                            </div>
                            <button
                                className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
                                onClick={() => { setEditId(null); setShowModal(true); }}
                            >
                                <span style={{ color: 'white' }}>➕</span>
                                <span>Thêm mới</span>
                            </button>
                        </div>
                    </div>
                </header>

                <main className=" pt-16 min-h-screen bg-gray-50">
                    <div className="max-w-screen-xl mx-auto px-4">
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên dịch vụ</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá (VND)</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentServices.length === 0 ? (
                                            <tr><td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">Không tìm thấy dịch vụ nào</td></tr>
                                        ) : (
                                            currentServices.map(service => (
                                                <tr key={service.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.id}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.name}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{service.description}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.price.toLocaleString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {service.status ? <span className="text-green-600">Hoạt động</span> : <span className="text-red-600">Tạm dừng</span>}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <button className="text-blue-600 hover:text-blue-800" onClick={() => handleEdit(service.id)}>
                                                                ✏️
                                                            </button>
                                                            <button className="text-red-600 hover:text-red-800" onClick={() => { setServiceToDelete(service.id); setShowDeleteModal(true); }}>
                                                                🗑️
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

                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button className={`px-4 py-2 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={goToPrevPage} disabled={currentPage === 1}>Trước</button>
                                    <div className="text-sm text-gray-700 py-2">{currentPage} / {totalPages}</div>
                                    <button className={`px-4 py-2 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage === totalPages || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={goToNextPage} disabled={currentPage === totalPages || totalPages === 0}>Sau</button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <p className="text-sm text-gray-700">Hiển thị {filteredServices.length > 0 ? startIndex + 1 : 0} đến {endIndex} của {filteredServices.length} kết quả</p>
                                    <div className="flex items-center space-x-4">
                                        <div>
                                            <label htmlFor="page-size" className="text-sm text-gray-700 mr-2">Hiển thị:</label>
                                            <select id="page-size" className="border border-gray-300 rounded-md text-sm pr-8 py-1 focus:ring-blue-600 focus:border-blue-600" value={pageSize} onChange={changePageSize}>
                                                <option value="10">10</option>
                                                <option value="20">20</option>
                                                <option value="50">50</option>
                                            </select>
                                        </div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            <button className={`px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={goToPrevPage} disabled={currentPage === 1}>⬅️</button>
                                            <div className="flex">{renderPaginationNumbers()}</div>
                                            <button className={`px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 ${currentPage === totalPages || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={goToNextPage} disabled={currentPage === totalPages || totalPages === 0}>➡️</button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                </main>

                {showModal && (
                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 opacity-75"></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"></span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg leading-6 font-medium text-gray-900">{editId !== null ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}</h3>
                                                <button type="button" className="text-gray-600 hover:text-red-500" onClick={resetForm}>❌</button>
                                            </div>
                                            <form id="service-form" className="space-y-4" onSubmit={handleSubmit}>
                                                <div>
                                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên dịch vụ</label>
                                                    <input type="text" id="name" name="name" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-600 focus:border-blue-600" value={formData.name} onChange={handleChange} required />
                                                </div>
                                                <div>
                                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Mô tả</label>
                                                    <textarea id="description" name="description" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-600 focus:border-blue-600" value={formData.description} onChange={handleChange} required />
                                                </div>
                                                <div>
                                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Giá (VND)</label>
                                                    <input type="number" id="price" name="price" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-600 focus:border-blue-600" value={formData.price} onChange={handleChange} required />
                                                </div>
                                                <div>
                                                    <label className="flex items-center gap-2">
                                                        <input type="checkbox" name="status" checked={formData.status} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                                        Hoạt động
                                                    </label>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button type="submit" form="service-form" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">Lưu</button>
                                    <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto" onClick={resetForm}>Hủy</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showDeleteModal && (
                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 opacity-75"></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"></span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                            ⚠️
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">Xác nhận xóa</h3>
                                            <div className="mt-2"><p className="text-sm text-gray-500">Bạn có chắc chắn muốn xóa dịch vụ này? Hành động này không thể hoàn tác.</p></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto" onClick={handleDelete}>Xóa</button>
                                    <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3" onClick={() => setShowDeleteModal(false)}>Hủy</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ServiceManager;