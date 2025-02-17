import { NextResponse } from 'next/server';
import { exec } from 'child_process';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  
  if (token !== process.env.DEPLOY_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  exec('cd /var/www/darkflows.com && ./deploy.sh --prod', (error, stdout, stderr) => {
    console.log('Deployment triggered:', { stdout, stderr, error });
  });

  return NextResponse.json({ message: 'Deployment triggered' });
} 