import AppNav from '@/components/AppNav';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
export default async function DashboardLayout({children}:{children:React.ReactNode}){const s=await createClient();if(s){const {data:{user}}=await s.auth.getUser();if(!user)redirect('/login')}return <div className="app-shell"><AppNav/><main className="content">{children}</main></div>}
