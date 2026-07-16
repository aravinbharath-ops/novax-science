const loginPanel=document.getElementById('loginPanel');
const dashboard=document.getElementById('dashboard');
const loginForm=document.getElementById('loginForm');
const tokenInput=document.getElementById('tokenInput');
const loginStatus=document.getElementById('loginStatus');
const logoutButton=document.getElementById('logoutButton');
const enquiryList=document.getElementById('enquiryList');
const emptyState=document.getElementById('emptyState');
const searchInput=document.getElementById('searchInput');
const statusFilter=document.getElementById('statusFilter');

let token=sessionStorage.getItem('novax_admin_token')||'';
let enquiries=[];

function authHeaders(){return{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'}}

async function loadEnquiries(){
  const params=new URLSearchParams();
  if(searchInput.value.trim())params.set('search',searchInput.value.trim());
  if(statusFilter.value)params.set('status',statusFilter.value);
  const response=await fetch(`/api/admin/enquiries?${params}`,{headers:authHeaders()});
  if(response.status===401)throw new Error('Invalid admin token.');
  const data=await response.json();
  if(!data.ok)throw new Error(data.message||'Unable to load enquiries.');
  enquiries=data.enquiries||[];
  render();
}

function render(){
  enquiryList.innerHTML='';
  emptyState.classList.toggle('hidden',enquiries.length>0);
  document.getElementById('totalCount').textContent=enquiries.length;
  document.getElementById('newCount').textContent=enquiries.filter(x=>x.status==='new').length;
  document.getElementById('repliedCount').textContent=enquiries.filter(x=>x.status==='replied').length;

  enquiries.forEach(item=>{
    const card=document.createElement('article');
    card.className='enquiry';
    card.innerHTML=`
      <div class="enquiry-top">
        <div>
          <span class="type">${escapeHtml(item.enquiry_type)}</span>
          <h3>${escapeHtml(item.name)}</h3>
          <div class="meta"><a href="mailto:${escapeHtml(item.email)}">${escapeHtml(item.email)}</a> · ${new Date(item.created_at+'Z').toLocaleString()}</div>
        </div>
        <span class="status ${item.status}">${item.status}</span>
      </div>
      <div class="message">${escapeHtml(item.message)}</div>
      <div class="actions">
        <a href="mailto:${escapeHtml(item.email)}"><button>Reply by email</button></a>
        <button class="muted" data-status="replied" data-id="${item.id}">Mark replied</button>
        <button class="muted" data-status="archived" data-id="${item.id}">Archive</button>
        <button class="danger" data-delete="${item.id}">Delete</button>
      </div>`;
    enquiryList.appendChild(card);
  });
}

function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}

loginForm.addEventListener('submit',async e=>{
  e.preventDefault();
  token=tokenInput.value.trim();
  try{
    await loadEnquiries();
    sessionStorage.setItem('novax_admin_token',token);
    loginPanel.classList.add('hidden');
    dashboard.classList.remove('hidden');
    logoutButton.classList.remove('hidden');
  }catch(err){loginStatus.textContent=err.message}
});

enquiryList.addEventListener('click',async e=>{
  const statusBtn=e.target.closest('[data-status]');
  const deleteBtn=e.target.closest('[data-delete]');
  try{
    if(statusBtn){
      await fetch('/api/admin/enquiries',{method:'PATCH',headers:authHeaders(),body:JSON.stringify({id:Number(statusBtn.dataset.id),status:statusBtn.dataset.status})});
      await loadEnquiries();
    }
    if(deleteBtn&&confirm('Delete this enquiry permanently?')){
      await fetch('/api/admin/enquiries',{method:'DELETE',headers:authHeaders(),body:JSON.stringify({id:Number(deleteBtn.dataset.delete)})});
      await loadEnquiries();
    }
  }catch(err){alert(err.message)}
});

document.getElementById('refreshButton').addEventListener('click',loadEnquiries);
statusFilter.addEventListener('change',loadEnquiries);
let timer;searchInput.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(loadEnquiries,350)});
logoutButton.addEventListener('click',()=>{sessionStorage.removeItem('novax_admin_token');location.reload()});

if(token){
  loadEnquiries().then(()=>{
    loginPanel.classList.add('hidden');dashboard.classList.remove('hidden');logoutButton.classList.remove('hidden')
  }).catch(()=>sessionStorage.removeItem('novax_admin_token'));
}
