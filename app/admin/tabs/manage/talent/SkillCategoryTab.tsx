'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';


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
  const startEdit = (c: Category) => {
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/skillcategories/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchCategories();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
    } finally {
      setLoading(false);
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
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Skill Categories</h2>
          <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white hover:bg-blue-700">
            {showForm ? 'Cancel' : '+ Add Category'}
          </Button>
        </div>
        {showForm && (
          <Card className="p-6 mb-4">
            <form onSubmit={createCategory} className="space-y-4">
              <input
                type="text"
                placeholder="Category Name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
              <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">Create Category</Button>
            </form>
          </Card>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((c) => (
            <Card key={c.id} className="p-4 flex justify-between items-center border-2 border-blue-500/70 shadow-sm rounded-xl">
              {editId === c.id ? (
                <form onSubmit={saveEdit} className="flex-1 flex gap-2 items-center">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="px-3 py-2 border rounded w-full"
                    required
                    disabled={loading}
                  />
                  <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={loading}>Save</Button>
                  <Button type="button" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50" onClick={cancelEdit} disabled={loading}>Cancel</Button>
                </form>
              ) : (
                <>
                  <div>
                    <h3 className="font-bold">{c.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => startEdit(c)} aria-label="Edit">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => handleDelete(c.id)} aria-label="Delete">
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
