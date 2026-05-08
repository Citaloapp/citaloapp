import { NextResponse } from 'next/server';

export async function POST(request) {
  const { password } = await request.json();
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Admin no configurado' }, { status: 500 });
  }
  if (password === process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
}
