import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

// update notes
export async function PATCH(_req, { params }) {
    const id = params?.id;

    if (!id) {
        return NextResponse.json(
            {
                error: 'id wajib',
            },
            { status: 400 }
        );
    }

    try {
        const body = await _req.json();
        const title = (body?.title ?? '').trim();
        const content = (body?.content ?? '').trim();

        if (!title | !content) {
            return NextResponse.json(
                { error: 'title & content wajib diisi!' },
                { status: 400 }
            );
        }

        const query = `update notes set title = $2, content = $3, updated_at = now() where id = $1 returning *;`;

        const { rows } = await pool.query(query, [id, title, content]);

        if (rows.length === 0) {
            return NextResponse.json(
                { error: 'Note tidak ditemukan!' },
                { status: 404 }
            );
        }

        return NextResponse.json(rows[0], { status: 200 });
    } catch (error) {
        console.error('Gagal update notes: ', error);
        return NextResponse.json(
            { error: 'Gagal update notes!' },
            { status: 500 }
        );
    }
}

// delete note
export async function DELETE(_req, { params }) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json(
            {
                error: 'id wajib',
            },
            { statu: 400 }
        );
    }

    try {
        const del = `delete from notes where id = $1 returning *;`;

        const { rows } = await pool.query(del, [id]);

        if (rows.length === 0) {
            return NextResponse.json(
                { error: 'Note tidak ditemukan!' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                ok: true,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Gagal hapus note: ', error);
        return NextResponse.json(
            { error: 'Gagal hapus note' },
            { status: 500 }
        );
    }
}
