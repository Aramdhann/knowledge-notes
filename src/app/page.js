'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

// Create Catatan
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

// Ambil Catatan
async function fetchNotes({ page, pageSize }) {
    const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
    });

    const res = await fetch(`/api/notes?${params.toString()}`, {
        cache: 'no-cache',
    });

    if (!res.ok) {
        throw new Error('Gagal memuat catatan!');
    }

    return res.json();
}

// Update Catatan
async function patchNotes({ id, title, content }) {
    const res = await fetch(`/api/notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({
            title,
            content,
        }),
    });

    if (!res.ok) {
        throw new Error('Gagal update catatan!');
    }

    return res.json();
}

// Delete Note
async function deleteNotes(id) {
    const res = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
    });

    if (!res.ok) {
        throw new Error('Gagal delete catatan!');
    }

    return res.json();
}

export default function Home() {
    const queryClient = useQueryClient();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [selected, setSelected] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');

    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [confirmTargetDelete, setConfirmDeleteTarget] = useState('');

    const [page, setPage] = useState(1);
    const pageSize = 10;

    const { mutateAsync: addNote, isPending: isSaving } = useMutation({
        mutationFn: createNote,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
            setPage(1);
        },
    });

    const { mutateAsync: updateNote, isPending: isUpdating } = useMutation({
        mutationFn: patchNotes,
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
            setSelected(updated);
            setIsEditing(false);
        },
    });

    const { mutateAsync: removeNote, isPending: isDeleting } = useMutation({
        mutationFn: deleteNotes,
        onSuccess: (del) => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
            closeNotes();
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

    async function onSubmitEdit(e) {
        e.preventDefault();
        if (!selected) {
            return;
        }

        const titleEdited = editTitle.trim();
        const contentEdited = editContent.trim();

        if (!titleEdited || !contentEdited) {
            return;
        }

        await updateNote({
            id: selected.id,
            title: titleEdited,
            content: contentEdited,
        });
    }

    const { data, isLoading, isError } = useQuery({
        queryKey: ['notes', page, pageSize],
        queryFn: () => fetchNotes({ page, pageSize }),
        keepPreviouseData: true,
    });

    function openNotes(it) {
        setSelected(it);
        setOpenModal(true);
        setIsEditing(false);
    }

    function closeNotes() {
        setSelected(null);
        setOpenModal(false);
        setIsEditing(false);
    }

    useEffect(() => {
        if (!openModal) return;

        // tidak bisa discroll
        const original = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        // tutup dengan ESC
        const onKey = (e) => {
            if (e.key === 'Escape') {
                closeNotes();
            }
        };
        window.addEventListener('keydown', onKey);

        return () => {
            document.body.style.overflow = original;
            window.removeEventListener('keydown', onKey);
        };
    }, [openModal]);

    useEffect(() => {
        if (!confirmDeleteOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e) => {
            if (e.key === 'Escape') closeConfirm();
        };
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener('keydown', onKey);
        };
    }, [confirmDeleteOpen]);

    function askDelete(id, title) {
        setConfirmDeleteOpen(true);
        setConfirmDeleteTarget({ id, title });
    }

    function closeConfirm() {
        setConfirmDeleteOpen(false);
        setConfirmDeleteTarget(null);
    }

    async function handleConfirmDelete() {
        if (!confirmTargetDelete) return;

        await removeNote(selected.id);
        closeConfirm();
    }

    return (
        <main className="font-sans max-w-3xl mx-auto p-6">
            <h1 className="mb-4 font-semibold text-xl font-pixel">
                KNOWLEDGE NOTES
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
                            'text-sm peer w-full rounded-md border border-gray-300 bg-white p-3',
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
                            'text-sm peer w-full rounded-md border border-gray-300 bg-white p-3',
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
                        className="text-sm border border-gray-300 rounded-md px-4 py-2 inline-flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 disabled:opacity-60"
                    >
                        {isSaving ? 'menyimpan...' : 'Tambahkan'}
                    </button>
                </div>
            </form>
            <section className="mt-4">
                <h2 className="mb-3 font-semibold text-xl font-pixel">
                    DAFTAR CATATAN
                </h2>

                {isLoading && (
                    <p className="text-sm text-gray-500 italic animate-pulse">
                        Sedang memuat catatan...
                    </p>
                )}
                {isError && (
                    <p className="text-sm text-red-500 italic">
                        Gagal memuat catatan...
                    </p>
                )}
                {!isLoading && Array.isArray(data) && data.length === 0 && (
                    <p className="text-gray-500 text-sm italic">
                        Tidak ditemukan catatan.
                    </p>
                )}

                {/* MODAL NOTES */}
                {openModal && selected && (
                    <div
                        aria-modal="true"
                        role="dialog"
                        aria-labelledby="note-title"
                        className={[
                            'fixed inset-0 z-40 flex items-center justify-center p-2',
                            'bg-black/40 backdrop-blur-sm',
                        ].join(' ')}
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                closeNotes();
                            }
                        }}
                    >
                        {/* Modal Card */}
                        <div
                            className={[
                                'bg-white max-w-lg rounded-md border border-gray-300',
                                'shadow-md p-5 max-h-[85vh] overflow-hidden flex flex-col',
                            ].join(' ')}
                            role="document"
                        >
                            <div className="flex justify-between gap-3">
                                <h3
                                    id="note-title"
                                    className="font-semibold uppercase"
                                >
                                    {isEditing
                                        ? 'Edit Catatan'
                                        : selected.title}
                                </h3>

                                <button
                                    type="button"
                                    onClick={() => closeNotes()}
                                    className="rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100 active:scale-90 transition duration-300"
                                >
                                    Esc
                                </button>
                            </div>

                            {!isEditing ? (
                                <>
                                    <div className="mt-4 text-sm text-gray-700 whitespace-pre-line flex-1 overflow-y-auto overscroll-contain">
                                        {selected.content}
                                    </div>

                                    <div className="flex justify-between">
                                        <button
                                            type="button"
                                            className="mt-4 rounded-md bg-red-500 text-white border-gray-300 px-2 py-1 text-xs hover:bg-red-600 active:scale-90 transition duration-300"
                                            onClick={() => {
                                                askDelete(
                                                    selected.id,
                                                    selected.title
                                                );
                                            }}
                                        >
                                            Delete
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-4 rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100 active:scale-90 transition duration-300"
                                            onClick={() => {
                                                setIsEditing(true);
                                                setEditTitle(selected.title);
                                                setEditContent(
                                                    selected.content
                                                );
                                            }}
                                        >
                                            Edit
                                        </button>
                                    </div>

                                    <div className="mt-4 text-xs text-gray-400">
                                        {selected.created_at &&
                                            `Dibuat: ${new Date(
                                                selected.created_at
                                            ).toLocaleString('id-ID')}`}
                                        {selected.updated_at && (
                                            <div className="italic text-gray-300">
                                                Diperbarui:{' '}
                                                {new Date(
                                                    selected.updated_at
                                                ).toLocaleString('id-ID')}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <form
                                    className="mt-3 space-y-4"
                                    onSubmit={onSubmitEdit}
                                >
                                    <div className="relative">
                                        <input
                                            id="edit title"
                                            name="edit title"
                                            value={editTitle}
                                            onChange={(e) =>
                                                setEditTitle(e.target.value)
                                            }
                                            placeholder=" "
                                            className={[
                                                'text-sm peer w-full rounded-md border border-gray-300 bg-white p-3',
                                                'outline-none',
                                                'transition-all duration-300',
                                                'focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:shadow-md',
                                            ].join(' ')}
                                        />
                                        <label
                                            htmlFor="edit title"
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

                                    <div className="relative">
                                        <textarea
                                            id="edit content"
                                            name="edit content"
                                            value={editContent}
                                            onChange={(e) =>
                                                setEditContent(e.target.value)
                                            }
                                            placeholder=" "
                                            className={[
                                                'text-sm peer w-full rounded-md border border-gray-300 bg-white p-3',
                                                'outline-none',
                                                'transition-all duration-300',
                                                'min-h-[150px] resize-y',
                                                'focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:shadow-md',
                                            ].join(' ')}
                                        />

                                        <label
                                            htmlFor="edit content"
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

                                    <div className="flex justify-between">
                                        <button
                                            type="button"
                                            className="rounded-md bg-black text-white border-gray-300 px-2 py-1 text-xs hover:bg-gray-700 active:scale-90 transition duration-300"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setEditTitle(selected.title);
                                                setEditContent(
                                                    selected.content
                                                );
                                            }}
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            className="rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100 active:scale-90 transition duration-300 disabled:opacity-60"
                                            disabled={isUpdating}
                                        >
                                            {isUpdating
                                                ? 'Menyimpan...'
                                                : 'Simpan'}
                                        </button>
                                    </div>

                                    <div className="mt-4 text-xs text-gray-400">
                                        {selected.created_at &&
                                            `Dibuat: ${new Date(
                                                selected.created_at
                                            ).toLocaleString('id-ID')}`}
                                        {selected.updated_at && (
                                            <div className="italic text-gray-300">
                                                Diperbarui:{' '}
                                                {new Date(
                                                    selected.updated_at
                                                ).toLocaleString('id-ID')}
                                            </div>
                                        )}
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}

                {confirmDeleteOpen && confirmTargetDelete && (
                    <div
                        aria-modal="true"
                        role="dialog"
                        aria-labelledby="confirm-delete"
                        className={[
                            'fixed inset-0 z-50 flex items-center justify-center p-2',
                            'bg-black/40 backdrop-blur-sm p-2',
                        ].join(' ')}
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                closeConfirm();
                            }
                        }}
                    >
                        <div
                            className={[
                                'flex flex-col space-y-3 bg-white max-w-lg rounded-md border border-gray-300',
                                'shadow-md p-5',
                            ].join(' ')}
                            role="document"
                        >
                            <div className="flex justify-between gap-10 items-center">
                                <h4 className="font-semibold text-sm font-pixel uppercase">
                                    Hapus Catatan?
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => closeConfirm()}
                                    className="rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100 active:scale-90 transition duration-300"
                                >
                                    Esc
                                </button>
                            </div>
                            <p className="mt-2 text-sm">
                                Yakin nih, dihapus? 🤔
                            </p>

                            <div className="mt-4 flex justify-between">
                                <button
                                    type="button"
                                    className="rounded-md bg-black text-white border-gray-300 px-2 py-1 text-xs hover:bg-gray-700 active:scale-90 transition duration-300"
                                    onClick={() => {
                                        closeConfirm();
                                    }}
                                >
                                    G Jadi
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100 active:scale-90 transition duration-300 disabled:opacity-60"
                                    disabled={isDeleting}
                                    onClick={handleConfirmDelete}
                                >
                                    {isDeleting ? 'Menghapus...' : 'Jadi'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* LIST NOTES */}
                <ul className="text-sm grid gap-3">
                    {(data?.items ?? []).map((it) => (
                        <li
                            key={it.id}
                            className={[
                                'rounded-md border border-gray-200 p-4',
                                'transition-all duration-200 ease-out',
                                'hover:-translate-y-1 hover:shadow-md',
                                'active:translate-y-0',
                            ].join(' ')}
                            onClick={() => openNotes(it)}
                        >
                            <div className="font-semibold uppercase clamp-1">
                                {it.title}
                            </div>
                            <div className="mt-1 flex-1 overflow-hidden">
                                <p className="text-[12px] text-gray-700 whitespace-pre-line clamp-4">
                                    {it.content}
                                </p>
                            </div>

                            <div className="mt-2 text-xs text-gray-400">
                                {it.created_at &&
                                    `Dibuat: ${new Date(
                                        it.created_at
                                    ).toLocaleString('id-ID')}`}
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
                {data && data.total > 0 && (
                    <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                        <span className="text-gray-500">
                            Hal {data.page} dari{' '}
                            {Math.max(1, Math.ceil(data.total / data.pageSize))}{' '}
                            • {data.total} catatan
                        </span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    setPage((p) => Math.max(1, p - 1))
                                }
                                disabled={page <= 1 || isLoading}
                                className="rounded-md border px-3 py-1 disabled:opacity-50 hover:bg-gray-50 transition"
                            >
                                Prev
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const totalPages = Math.max(
                                        1,
                                        Math.ceil((data?.total ?? 0) / pageSize)
                                    );
                                    setPage((p) => Math.min(totalPages, p + 1));
                                }}
                                disabled={
                                    isLoading ||
                                    (data &&
                                        page >=
                                            Math.ceil(
                                                data.total / data.pageSize
                                            ))
                                }
                                className="rounded-md border px-3 py-1 disabled:opacity-50 hover:bg-gray-50 transition"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}
