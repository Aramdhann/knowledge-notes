import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// tambah notes
export async function POST(req) {
    try {
        const { title, content } = await req.json();

        if (!title || !content) {
            return NextResponse.json(
                { error: 'title & content wajib diisi!' },
                { status: 400 }
            );
        }

        const query = `insert into notes (title, content) values ($1, $2) returning *;`;

        const { rows } = await pool.query(query, [title, content]);

        return NextResponse.json(rows[0], { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse(
            {
                error: 'Insert gagal',
            },
            { status: 500 }
        );
    }
}

// get all notes
export async function GET(req) {
    try {
        const query = `select * from notes n order by n.created_at desc`;

        const result = await pool.query(query);

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Gagal ambil data notes: ', error);
        return NextResponse.json(
            { error: 'Gagal ambil data notes' },
            { status: 500 }
        );
    }
}
