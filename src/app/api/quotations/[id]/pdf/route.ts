import { NextResponse } from 'next/server';
import { serverFetch } from '@/lib/serverFetch';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const res = await serverFetch.get(`/quotations/${id}/pdf`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({
      message: 'Unable to export quotation PDF',
    }));
    return NextResponse.json(err, { status: res.status });
  }

  const pdfBuffer = await res.arrayBuffer();

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Quotation-${id.slice(0, 8)}.pdf"`,
    },
  });
}
