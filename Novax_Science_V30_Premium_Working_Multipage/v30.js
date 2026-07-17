
const menuButton=document.querySelector('.menu-button'),navLinks=document.querySelector('.nav-links');
if(menuButton&&navLinks){
 menuButton.addEventListener('click',()=>{const open=navLinks.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));document.body.classList.toggle('menu-open',open)});
 navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{navLinks.classList.remove('open');document.body.classList.remove('menu-open');menuButton.setAttribute('aria-expanded','false')}));
}
const verifyForm=document.getElementById('verifyForm'),verifyResult=document.getElementById('verifyResult');
if(verifyForm&&verifyResult){
 verifyForm.addEventListener('submit',async event=>{
  event.preventDefault();
  const input=verifyForm.querySelector('[name="batchCode"]');
  const code=String(input?.value||'').trim().toUpperCase();
  if(!code){verifyResult.className='verify-result';verifyResult.textContent='Enter the serial number printed on the product.';return}
  const submit=verifyForm.querySelector('button[type="submit"]');
  submit.disabled=true;submit.textContent='Checking…';verifyResult.className='verify-result';verifyResult.textContent='Searching the secure certificate registry…';
  try{
   const response=await fetch('/api/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({serial:code})});
   const data=await response.json();
   if(!response.ok||!data.verified){verifyResult.className='verify-result';verifyResult.innerHTML=`<strong>Authentication unsuccessful</strong><br>${data.message||'No active certificate was found for this serial number.'}`;return}
   window.currentCertificateRecord=data.certificate;
   verifyResult.className='verify-result success';
   verifyResult.innerHTML=`<strong>✓ Authentic Novax Science Product</strong><br>${esc(data.certificate.product)} · ${esc(data.certificate.strength)} · ${esc(data.certificate.analysisDate)}<br><button type="button" class="inline-certificate-button" data-open-current-certificate>View Certificate of Analysis</button>`;
  }catch(error){verifyResult.className='verify-result';verifyResult.innerHTML='<strong>Verification unavailable.</strong><br>Please try again in a moment.'}
  finally{submit.disabled=false;submit.textContent='Verify Product'}
 });
}
const contactForm=document.getElementById('contactForm');
if(contactForm){
 contactForm.addEventListener('submit',async event=>{
  event.preventDefault();
  const button=contactForm.querySelector('button[type="submit"]'),status=document.getElementById('contactStatus'),fd=new FormData(contactForm);
  const payload={name:String(fd.get('name')||'').trim(),email:String(fd.get('email')||'').trim(),enquiryType:String(fd.get('subject')||'').trim(),message:String(fd.get('message')||'').trim()};
  button.disabled=true;button.textContent='Sending…';status.className='contact-status';status.textContent='Submitting your enquiry securely…';
  try{
   const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
   const data=await response.json();
   if(!response.ok||!data.ok)throw new Error(data.message||'Unable to submit enquiry.');
   status.className='contact-status success';
   status.textContent=data.emailSent?'Thank you. Your enquiry has been sent successfully.':'Thank you. Your enquiry has been recorded successfully.';
   contactForm.reset();
  }catch(error){status.className='contact-status error';status.textContent=error.message||'We could not submit your enquiry. Please try again.'}
  finally{button.disabled=false;button.textContent='Send Enquiry'}
 });
}
const certificateModal=document.getElementById('certificateModal'),certificateGrid=document.getElementById('certificateGrid'),certificateImage=document.getElementById('certificateImage'),viewCertificateLink=document.getElementById('viewCertificateLink');
function esc(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]))}
function openCertificate(record){
 if(!certificateModal||!record)return;
 certificateGrid.innerHTML=`<div><span>Serial number</span><strong>${esc(record.serial)}</strong></div><div><span>Product</span><strong>${esc(record.product)}</strong></div><div><span>Strength</span><strong>${esc(record.strength)}</strong></div><div><span>Task number</span><strong>#${esc(record.taskNumber)}</strong></div><div><span>Batch</span><strong>${esc(record.batch)}</strong></div><div><span>Analysis date</span><strong>${esc(record.analysisDate)}</strong></div><div><span>Measured result</span><strong>${esc(record.result)}</strong></div><div><span>Purity</span><strong>${esc(record.purity)}</strong></div>`;
 certificateImage.src=record.certificate;certificateImage.alt=`Certificate of Analysis for ${record.product}`;viewCertificateLink.href=record.certificate;
 certificateModal.classList.add('open');certificateModal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');
}
function closeCertificate(){if(certificateModal){certificateModal.classList.remove('open');certificateModal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open')}}
document.addEventListener('click',e=>{if(e.target.closest('[data-open-current-certificate]')&&window.currentCertificateRecord)openCertificate(window.currentCertificateRecord);if(e.target.closest('[data-close-certificate]'))closeCertificate()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCertificate()});
