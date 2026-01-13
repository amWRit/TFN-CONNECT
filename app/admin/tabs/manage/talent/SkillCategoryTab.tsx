'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ConfirmModal from '@/components/ConfirmModal';


import { Pencil, Trash2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

export default function SkillCategoryTab() {

  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [editError, setEditError] = useState('');
  const startEdit = (c: Category) => {
    setEditError('');
    setEditId(c.id);
    setEditName(c.name);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName('');
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    if (!editName.trim()) {
      setEditError('Category name is required');
      return;
    }
    // Unique name check (case-insensitive, exclude current category)
    if (categories.some(c => c.id !== editId && c.name.trim().toLowerCase() === editName.trim().toLowerCase())) {
      setEditError('Category name must be unique');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/skillcategories/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName }),
      });
      if (res.ok) {
        setEditId(null);
        setEditName('');
        fetchCategories();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Failed to update category:', error);
    } finally {
      setLoading(false);
    }
  };

  // ConfirmModal state for delete
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/skillcategories/${deleteId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeleteId(null);
        fetchCategories();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
    } finally {
      setLoading(false);
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/skillcategories');
      if (res.ok) setCategories(await res.json());
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    if (!categoryName.trim()) {
      setAddError('Category name is required');
      return;
    }
    // Unique name check (case-insensitive)
    if (categories.some(c => c.name.trim().toLowerCase() === categoryName.trim().toLowerCase())) {
      setAddError('Category name must be unique');
      return;
    }
    try {
      const res = await fetch('/api/skillcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName }),
      });
      if (res.ok) {
        setCategoryName('');
        setShowForm(false);
        fetchCategories();
      }
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Skill Categories</h2>
          <Button onClick={() => { setAddError(''); setShowForm(!showForm); }} className="bg-blue-600 text-white hover:bg-blue-700">
            {showForm ? 'Cancel' : '+ Add Category'}
          </Button>
        </div>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
            <div className="relative w-full max-w-xl sm:max-w-2xl mx-2">
              <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-2xl p-4 sm:p-8 border-4 border-blue-400/70 max-h-[90vh] overflow-y-auto">
                <button
                  className="absolute top-3 right-3 text-blue-400 hover:text-blue-700 text-3xl font-bold transition-colors duration-150"
                  onClick={() => {
                    setShowForm(false);
                    setCategoryName('');
                  }}
                  aria-label="Close"
                >
                  &times;
                </button>
                <h2 className="text-2xl font-extrabold mb-6 text-blue-700 text-center tracking-tight drop-shadow">Add Skill Category</h2>
                <form onSubmit={createCategory} className="space-y-6">
                  <div>
                    <label className="block font-semibold mb-2 text-blue-700">Category Name *</label>
                    {addError && (
                      <div className="text-red-500 text-center font-semibold mb-2">{addError}</div>
                    )}
                    <input
                      type="text"
                      className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none text-lg shadow-sm"
                      placeholder="Category Name"
                      value={categoryName}
                      onChange={e => setCategoryName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex gap-4 mt-8">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 text-lg tracking-wide"
                    >
                      Create Category
                    </button>
                    <button
                      type="button"
                      className="flex-1 bg-white border-2 border-red-400 text-red-600 font-bold px-8 py-3 rounded-xl shadow transition-all duration-200 text-lg tracking-wide hover:bg-red-50 hover:border-red-600"
                      onClick={() => {
                        setShowForm(false);
                        setCategoryName('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {categories.map((c) => (
            <Card key={c.id} className="p-4 flex justify-between items-center border-2 border-blue-500/70 shadow-sm rounded-xl">
              {editId === c.id ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
                  <div className="relative w-full max-w-xl sm:max-w-2xl mx-2">
                    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-2xl p-4 sm:p-8 border-4 border-blue-400/70 max-h-[90vh] overflow-y-auto">
                      <button
                        className="absolute top-3 right-3 text-blue-400 hover:text-blue-700 text-3xl font-bold transition-colors duration-150"
                        onClick={cancelEdit}
                        aria-label="Close"
                      >
                        &times;
                      </button>
                      <h2 className="text-2xl font-extrabold mb-6 text-blue-700 text-center tracking-tight drop-shadow">Edit Skill Category</h2>
                      <form onSubmit={saveEdit} className="space-y-6">
                        <div>
                          <label className="block font-semibold mb-2 text-blue-700">Category Name *</label>
                          {editError && (
                            <div className="text-red-500 text-center font-semibold mb-2">{editError}</div>
                          )}
                          <input
                            type="text"
                            className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none text-lg shadow-sm"
                            placeholder="Edit category name..."
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            required
                            disabled={loading}
                          />
                        </div>
                        <div className="flex gap-4 mt-8">
                          <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 text-lg tracking-wide"
                            disabled={loading}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="flex-1 bg-white border-2 border-red-400 text-red-600 font-bold px-8 py-3 rounded-xl shadow transition-all duration-200 text-lg tracking-wide hover:bg-red-50 hover:border-red-600"
                            onClick={cancelEdit}
                            disabled={loading}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="font-bold">{c.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => startEdit(c)} aria-label="Edit">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => setDeleteId(c.id)} aria-label="Delete">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                        {/* Confirm Delete Modal */}
                        <ConfirmModal
                          open={!!deleteId}
                          title="Delete Category"
                          message="Are you sure you want to delete this category? This action cannot be undone."
                          confirmText="Delete"
                          cancelText="Cancel"
                          onConfirm={handleDelete}
                          onCancel={() => setDeleteId(null)}
                          loading={deleteLoading}
                        />
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
