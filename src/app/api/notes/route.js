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
        const { searchParams } = new URL(req.url);
        const pageParam = searchParams.get('page');
        const pageSizeParam = searchParams.get('pageSize');
        const usePagination = pageParam !== null || pageSizeParam !== null;

        if (usePagination) {
            const page = Math.max(1, parseInt(pageParam ?? '1', 10));
            const pageSize = Math.min(
                50,
                Math.max(1, parseInt(pageSizeParam ?? '10', 10))
            );
            const offset = (page - 1) * pageSize;

            // total rows
            const totalRes = await pool.query(
                'select count(*)::int as cnt from notes;'
            );
            const total = totalRes.rows[0].cnt;

            // query dengan limit/offset (jangan ubah nama variabel)
            const query = `
                select id, title, content, created_at, updated_at
                from notes n
                order BY n.created_at desc
                limit $1 OFFSET $2
            `;
            const result = await pool.query(query, [pageSize, offset]);

            return NextResponse.json({
                page,
                pageSize,
                total,
                items: result.rows,
            });
        }

        // fallback: tanpa pagination (tetap array)
        const query = `select * from notes n order by n.updated_at desc`;
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
