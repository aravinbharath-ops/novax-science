
const menu=document.querySelector('.menu'),nav=document.querySelector('.navlinks');
if(menu&&nav){menu.addEventListener('click',()=>{nav.classList.toggle('open');menu.setAttribute('aria-expanded',nav.classList.contains('open'))});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')))}
document.querySelectorAll('.faq-q').forEach(q=>q.addEventListener('click',()=>q.parentElement.classList.toggle('open')));
document.querySelectorAll('[data-verify-form]').forEach(form=>{
 const input=form.querySelector('input'),button=form.querySelector('button'),result=form.parentElement.querySelector('.result');
 const verify=async()=>{const code=input.value.trim(); if(!code){result.style.display='block';result.textContent='Enter the verification code printed on the product.';return}
 button.disabled=true;button.textContent='Checking…';result.style.display='block';result.textContent='Checking the secure record…';
 try{const r=await fetch('/api/verify?code='+encodeURIComponent(code));const d=await r.json();if(!r.ok)throw new Error(d.error||'Verification could not be completed.');
 result.innerHTML=`<strong>${d.verified?'Verified record':'Record status'}</strong><br>${d.product_name||d.product||''} ${d.strength||''}<br>${d.batch_number?'Batch: '+d.batch_number:''}`;}
 catch(e){result.textContent=e.message||'Verification could not be completed.'}finally{button.disabled=false;button.textContent='Verify code'}};
 button.addEventListener('click',verify);input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();verify()}});
});
const contact=document.querySelector('[data-contact-form]');
if(contact){contact.addEventListener('submit',async e=>{e.preventDefault();const status=contact.querySelector('.form-status'),button=contact.querySelector('button[type=submit]');button.disabled=true;button.textContent='Sending…';status.textContent='';try{const payload=Object.fromEntries(new FormData(contact));const r=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const d=await r.json();if(!r.ok)throw new Error(d.error||'Message could not be sent.');status.textContent='Thank you. Your enquiry has been received.';contact.reset()}catch(err){status.textContent=err.message}finally{button.disabled=false;button.textContent='Send enquiry'}})}
