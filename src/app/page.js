'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

async function createNote({ title, content }) {
    const res = await fetch('api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
    });

    if (!res.ok) {
        throw new Error('Gagal menambah catatan!');
    }

    return res.json();
}

async function fetchNotes() {
    const res = await fetch('/api/notes', {
        cache: 'no-cache',
    });

    if (!res.ok) {
        throw new Error('Gagal memuat catatan');
    }

    return res.json();
}

export default function Home() {
    const queryClient = useQueryClient();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const { mutateAsync: addNote, isPending: isSaving } = useMutation({
        mutationFn: createNote,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
        },
    });

    async function onSubmit(e) {
        e.preventDefault();
        const titleRaw = title.trim();
        const contentRaw = content.trim();

        if (!titleRaw || !contentRaw) {
            return;
        }

        await addNote({ title: titleRaw, content: contentRaw });
        setTitle('');
        setContent('');
    }

    const { data, isLoading, isError } = useQuery({
        queryKey: ['notes'],
        queryFn: fetchNotes,
    });

    return (
        <main className="font-sans max-w-3xl mx-auto p-6">
            <h1 className="mb-4 font-semibold text-xl font-pixel">
                Knowledge Notes
            </h1>

            <form className="space-y-4" onSubmit={onSubmit}>
                <div className="relative group">
                    {/* input judul */}
                    <input
                        id="title"
                        name="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder=" "
                        className={[
                            'peer w-full rounded-md border border-gray-300 bg-white p-3',
                            'outline-none',
                            'transition-all duration-300',
                            'focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:shadow-md',
                        ].join(' ')}
                    />
                    <label
                        htmlFor="title"
                        className={[
                            'pointer-events-none absolute left-3 top-3 text-gray-300',
                            'transition-all duration-300',
                            // ketika fokus atau ada nilai → label naik & mengecil
                            'peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600',
                            'peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm',
                            'peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs',
                            // latar kecil agar label terbaca saat naik
                            'px-1 bg-white',
                        ].join(' ')}
                    >
                        Title
                    </label>
                </div>
                <div className="relative group">
                    {/* input text area (content) */}
                    <textarea
                        id="content"
                        name="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder=" "
                        className={[
                            'peer w-full rounded-md border border-gray-300 bg-white p-3',
                            'outline-none',
                            'transition-all duration-300',
                            'min-h-[150px] resize-y',
                            'focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:shadow-md',
                        ].join(' ')}
                    />

                    <label
                        htmlFor="content"
                        className={[
                            'pointer-events-none absolute left-3 top-3 text-gray-300',
                            'transition-all duration-300',
                            'peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600',
                            'peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm',
                            'peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs',
                            'px-1 bg-white',
                        ].join(' ')}
                    >
                        Content
                    </label>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="border border-gray-300 rounded-md px-4 py-2 inline-flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 disabled:opacity-60"
                    >
                        {isSaving ? 'menyimpan...' : 'Tambahkan'}
                    </button>
                </div>
            </form>
            <section className="mt-4">
                <h2 className="mb-3 font-semibold text-xl font-pixel">
                    Daftar Catatan
                </h2>

                {isLoading && (
                    <p className="text-sm text-gray-700">
                        Sedang memuat catatan...
                    </p>
                )}
                {isError && <p>Gagal memuat catatan...</p>}
                {!isLoading && Array.isArray(data) && data.length === 0 && (
                    <p className="text-gray-500 text-sm italic">
                        Tidak ditemukan catatan.
                    </p>
                )}

                <ul className="text-sm grid gap-3">
                    {(data ?? []).map((it) => (
                        <li
                            key={it.id}
                            className={[
                                'rounded-md border border-gray-200 p-4',
                                'transition-all duration-200 ease-out',
                                'hover:-translate-y-1 hover:shadow-md',
                                'active:translate-y-0',
                            ].join(' ')}
                        >
                            <div className="font-semibold">{it.title}</div>
                            <p className="mt-1 text-[12px] text-gray-700 whitespace-pre-line">
                                {it.content}
                            </p>
                            <div className="mt-2 text-xs text-gray-400">
                                {it.created_at
                                    ? new Date(it.created_at).toLocaleString(
                                          'id-ID'
                                      )
                                    : ''}
                                {it.updated_at && (
                                    <p className="italic text-gray-300">
                                        diperbarui{' '}
                                        {new Date(it.updated_at).toLocaleString(
                                            'id-ID'
                                        )}
                                    </p>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </section>
        </main>
    );
}
