import { NextResponse } from 'next/server';
import { actualizarServicio, eliminarServicio } from '@/lib/sheets';

function checkAuth(request) {
  return request.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD;
}

export async function PUT(request, { params }) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const body = await request.json();
    await actualizarServicio(params.id, body);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Error del servidor' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    await eliminarServicio(params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Error del servidor' }, { status: 500 });
  }
}
