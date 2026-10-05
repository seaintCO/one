'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Home, Inbox, Users, WalletCards, Settings, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const desktopItems=[
  ['/app','Home',Home],
  ['/app/inbox','Inbox',Inbox],
  ['/app/customers','Customers',Users],
  ['/app/money','Money',WalletCards],
  ['/app/settings','Settings',Settings],
] as const;
const mobileItems=desktopItems;

export default function AppNav(){
  const path=usePathname(); const router=useRouter(); const [phone,setPhone]=useState('Business line');
  const active=(href:string)=>href==='/app'?path===href:path.startsWith(href);
  useEffect(()=>{fetch('/api/crm/bootstrap',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{if(j?.phoneNumber)setPhone(j.phoneNumber)}).catch(()=>{})},[]);
  async function logout(){const s=createClient();if(s)await s.auth.signOut();router.replace('/login');router.refresh()}
  return <>
    <aside className="sidebar">
      <div className="sidebar-brand">ONE<span>.</span></div>
      {desktopItems.map(([href,label,Icon])=><Link key={href} href={href} className={'navitem '+(active(href)?'active':'')}><Icon size={17}/>{label}</Link>)}
      <div className="sidebar-spacer"/>
      <div className="line-status"><small><i/> BUSINESS LINE</small><strong>{phone}</strong></div>
      <button type="button" onClick={logout} className="navitem" style={{width:'100%',background:'transparent',border:0,color:'inherit'}}><LogOut size={17}/>Log out</button>
    </aside>
    <nav className="mobilebar" aria-label="App navigation">{mobileItems.map(([href,label,Icon])=><Link key={href} href={href} className={active(href)?'active':''}><Icon size={19}/><div>{label}</div></Link>)}</nav>
  </>
}
