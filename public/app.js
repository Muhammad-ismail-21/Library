// public/app.js
// public/app.js (improved error handling)
async function fetchSnippets(){
  const el = document.getElementById('snippetList');
  el.innerText = 'Loading...';
  try {
    const res = await fetch('/api/snippets');
    if (!res.ok) {
      // show status and text for debugging
      const txt = await res.text();
      el.innerText = `Error loading (${res.status}): ${txt.substring(0, 200)}`;
      console.error('API error', res.status, txt);
      return;
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      el.innerText = 'Error loading: unexpected response format';
      console.error('Unexpected response', data);
      return;
    }
    if (data.length === 0) { el.innerText = 'No snippets yet.'; return; }
    el.innerHTML = data.map(s => renderSnippet(s)).join('');
  } catch (err) {
    el.innerText = 'Network or parsing error: ' + (err && err.message);
    console.error('fetchSnippets error', err);
  }
}


function renderSnippet(s){
  const tags = s.tags?.length ? s.tags.join(', ') : '';
  const created = new Date(s.createdAt).toLocaleString();
  return `
    <div class="snippet" data-id="${s._id}">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <strong>${escapeHtml(s.title)}</strong>
        <div>
          <button class="editBtn" data-id="${s._id}">Edit</button>
          <button class="deleteBtn" data-id="${s._id}">Delete</button>
        </div>
      </div>
      <div class="meta">${s.language || ''} • ${tags} • ${created}</div>
      <pre>${escapeHtml(s.content)}</pre>
    </div>
  `;
}

function escapeHtml(str){ if(!str) return ''; return String(str).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

document.getElementById('snippetForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const id = fd.get('snippetId') || '';
  const payload = {
    title: fd.get('title'),
    language: fd.get('language'),
    tags: fd.get('tags'),
    content: fd.get('content')
  };
  const status = document.getElementById('status');
  status.innerText = id ? 'Updating...' : 'Saving...';
  try{
    const url = id ? `/api/snippets/${id}` : '/api/snippets';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    const body = await res.json();
    if (res.ok) {
      status.innerText = id ? 'Updated ✓' : 'Saved ✓';
      e.target.reset();
      clearEditState();
      fetchSnippets();
    } else {
      status.innerText = 'Error: ' + (body.error || res.statusText);
    }
  }catch(err){ status.innerText = 'Network error'; }
  setTimeout(()=> status.innerText = '', 2500);
});

document.getElementById('cancelEdit').addEventListener('click', ()=>{
  document.getElementById('snippetForm').reset();
  clearEditState();
});

function setEditState(snippet){
  document.getElementById('formTitle').innerText = 'Edit Snippet';
  document.getElementById('saveBtn').innerText = 'Update Snippet';
  document.getElementById('cancelEdit').style.display = 'inline-block';
  document.getElementById('snippetId').value = snippet._id;
  const f = document.getElementById('snippetForm');
  f.title.value = snippet.title || '';
  f.language.value = snippet.language || '';
  f.tags.value = (snippet.tags || []).join(', ');
  f.content.value = snippet.content || '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function clearEditState(){
  document.getElementById('formTitle').innerText = 'Add Snippet';
  document.getElementById('saveBtn').innerText = 'Save Snippet';
  document.getElementById('cancelEdit').style.display = 'none';
  document.getElementById('snippetId').value = '';
}

document.getElementById('snippetList').addEventListener('click', async (e)=>{
  const editBtn = e.target.closest('.editBtn');
  if (editBtn) {
    const id = editBtn.dataset.id;
    // fetch single snippet (or extract from DOM). We'll fetch fresh copy:
    try {
      const res = await fetch(`/api/snippets`);
      const list = await res.json();
      const sn = list.find(x => x._id === id);
      if (sn) setEditState(sn);
    } catch(err) { console.error(err); }
    return;
  }

  const delBtn = e.target.closest('.deleteBtn');
  if (delBtn) {
    const id = delBtn.dataset.id;
    if (!confirm('Delete this snippet?')) return;
    try {
      const res = await fetch(`/api/snippets/${id}`, { method: 'DELETE' });
      const body = await res.json();
      if (res.ok) {
        fetchSnippets();
      } else {
        alert('Delete error: ' + (body.error || res.statusText));
      }
    } catch(err) {
      alert('Network error');
    }
  }
});

fetchSnippets();
