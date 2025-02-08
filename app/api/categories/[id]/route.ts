import { NextRequest } from 'next/server';



export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const {  } = await context.params;
  // Use id in your code...
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const {  } = await context.params;
  // Use id in your code...
} 