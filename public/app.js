const socket = io();
const $ = id => document.getElementById(id);
let selectedCapacity = 6;
let selectedDeck = 'berserker';
let currentRoom = null;
let toastTimer;

const decks = {
  berserker: {
    name: 'เบอร์เซิร์กเกอร์', description: 'นักรบสายบุกที่เน้นสร้างความเสียหายสูง เหมาะกับผู้เล่นที่ชอบเปิดเกมรุก',
    cards: [
      {name:'ฟันสะท้านดันเจี้ยน',type:'attack',typeName:'โจมตี',text:'โจมตีคู่ต่อสู้หนึ่งคน สร้างความเสียหาย 2 หน่วย',power:'พลังโจมตี 2'},
      {name:'เดือดพล่าน',type:'skill',typeName:'ความสามารถ',text:'เมื่อพลังชีวิตเหลือน้อยกว่า ครึ่งหนึ่ง การโจมตีครั้งถัดไปของคุณแรงขึ้น 1 หน่วย',power:'เพิ่มพลังโจมตี +1'},
      {name:'ยืนหยัดไม่ถอย',type:'defense',typeName:'ป้องกัน',text:'ลดความเสียหายจากการโจมตีครั้งถัดไปที่ได้รับลง 2 หน่วย',power:'ป้องกัน 2'},
      {name:'ขวานหมุนกวาด',type:'attack',typeName:'โจมตี',text:'สร้างความเสียหาย 1 หน่วยแก่คู่ต่อสู้ทุกคน',power:'โจมตีหมู่'},
    ]
  },
  arcanist: {
    name: 'อาร์คานิสต์', description: 'จอมเวทผู้ควบคุมสนามรบ ใช้เวทมนตร์และเอฟเฟกต์พิเศษเพื่อพลิกสถานการณ์',
    cards: [
      {name:'ลูกไฟอาคม',type:'attack',typeName:'โจมตี',text:'เลือกคู่ต่อสู้หนึ่งคนและสร้างความเสียหาย 2 หน่วย',power:'พลังโจมตี 2'},
      {name:'เกราะผลึก',type:'defense',typeName:'ป้องกัน',text:'ป้องกันความเสียหาย 2 หน่วยจากการโจมตีหนึ่งครั้ง',power:'ป้องกัน 2'},
      {name:'สายฟ้ากระโดด',type:'attack',typeName:'โจมตี',text:'สร้างความเสียหาย 1 หน่วยแก่เป้าหมาย และเลือกผู้เล่นอีกคนรับความเสียหาย 1 หน่วย',power:'โจมตี 2 เป้าหมาย'},
      {name:'สมาธิเวทมนตร์',type:'skill',typeName:'ความสามารถ',text:'จั่วการ์ดเพิ่ม 1 ใบในเทิร์นถัดไป',power:'จั่วการ์ด +1'},
    ]
  },
  shadow: {
    name: 'ชาโดว์เบลด', description: 'นักฆ่าผู้ว่องไว เน้นจังหวะ การหลบหลีก และเลือกโจมตีเป้าหมายที่ได้เปรียบ',
    cards: [
      {name:'แทงจากเงามืด',type:'attack',typeName:'โจมตี',text:'สร้างความเสียหาย 2 หน่วย หากเป้าหมายเพิ่งได้รับความเสียหายในรอบนี้ เพิ่มอีก 1 หน่วย',power:'พลังโจมตี 2–3'},
      {name:'ก้าวพริบตา',type:'defense',typeName:'ป้องกัน',text:'หลบการโจมตีหนึ่งครั้งที่กำลังจะสร้างความเสียหายให้คุณ',power:'หลบ 1 ครั้ง'},
      {name:'พิษอ่อน',type:'skill',typeName:'ความสามารถ',text:'ทำเครื่องหมายพิษบนคู่ต่อสู้หนึ่งคน ให้ได้รับความเสียหาย 1 หน่วยเมื่อเริ่มเทิร์นถัดไป',power:'พิษ 1 หน่วย'},
      {name:'มีดบิน',type:'attack',typeName:'โจมตี',text:'สร้างความเสียหาย 1 หน่วยแก่คู่ต่อสู้หนึ่งคน แล้วจั่วการ์ด 1 ใบ',power:'โจมตี 1 • จั่ว 1'},
    ]
  },
  guardian: {
    name: 'การ์เดียน', description: 'ผู้พิทักษ์ที่ยืนหยัดแนวหน้า ป้องกันตัวเองและช่วยลดแรงกดดันให้ทีม',
    cards: [
      {name:'โล่พิทักษ์',type:'defense',typeName:'ป้องกัน',text:'ลดความเสียหายที่คุณได้รับจากการโจมตีหนึ่งครั้งลง 3 หน่วย',power:'ป้องกัน 3'},
      {name:'กระแทกโล่',type:'attack',typeName:'โจมตี',text:'สร้างความเสียหาย 1 หน่วย และทำให้เป้าหมายเสียจังหวะในเทิร์นถัดไป',power:'พลังโจมตี 1'},
      {name:'คำสัตย์ผู้พิทักษ์',type:'skill',typeName:'ความสามารถ',text:'เลือกผู้เล่นหนึ่งคน ลดความเสียหายครั้งถัดไปที่เขาได้รับลง 1 หน่วย',power:'ปกป้องเพื่อน'},
      {name:'กำแพงศักดิ์สิทธิ์',type:'defense',typeName:'ป้องกัน',text:'ป้องกันความเสียหาย 1 หน่วยจากการโจมตีทุกครั้งจนจบเทิร์นนี้',power:'ป้องกันต่อเนื่อง'},
    ]
  }
};

function toast(message) {
  const el = $('toast'); el.textContent = message; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}
function show(view) { document.querySelectorAll('.view').forEach(v => v.classList.remove('active')); $(view).classList.add('active'); }
function playerName(id) { return ($ (id).value || '').trim().slice(0,18) || 'Player'; }
function selectDeck(id) {
  if (!decks[id]) return;
  selectedDeck = id;
  document.querySelectorAll('[data-deck]').forEach(btn => {
    const chosen = btn.dataset.deck === id;
    btn.classList.toggle('selected', chosen); btn.setAttribute('aria-pressed', String(chosen));
    const badge = btn.querySelector('em'); if (badge) badge.textContent = chosen ? 'เลือกอยู่' : '';
  });
  $('selectedDeckNote').innerHTML = `เด็คที่เลือก: <strong>${decks[id].name}</strong> — ${decks[id].description}`;
}
function renderCards() {
  const deck = decks[$('cardModal').dataset.deck];
  const query = $('cardSearch').value.trim().toLowerCase();
  const type = $('cardTypeFilter').value;
  const cards = deck.cards.filter(card => (type === 'all' || card.type === type) && (card.name.toLowerCase().includes(query) || card.text.toLowerCase().includes(query)));
  $('cardList').innerHTML = cards.length ? cards.map(card => `<article class="ability-card" data-type="${card.type}"><div class="ability-card-top"><span class="ability-card-type">${card.typeName}</span></div><h3>${escapeHtml(card.name)}</h3><p>${escapeHtml(card.text)}</p><div class="card-power">✦ ${escapeHtml(card.power)}</div></article>`).join('') : '<div class="empty-cards">ไม่พบการ์ดที่ตรงกับการค้นหา</div>';
}
function openDeckViewer(id) {
  const deck = decks[id]; if (!deck) return;
  $('cardModal').dataset.deck = id; $('modalDeckName').textContent = deck.name;
  $('modalDeckDescription').textContent = deck.description;
  $('cardSearch').value = ''; $('cardTypeFilter').value = 'all'; renderCards();
  $('cardModal').hidden = false; $('cardModal').setAttribute('aria-hidden','false');
  $('closeCardModal').focus();
}
function closeDeckViewer() { $('cardModal').hidden = true; $('cardModal').setAttribute('aria-hidden','true'); }

$('showCreate').onclick = () => show('create');
$('showJoin').onclick = () => show('join');
document.querySelectorAll('[data-home]').forEach(b => b.onclick = () => show('home'));
document.querySelectorAll('[data-cap]').forEach(b => b.onclick = () => {
  selectedCapacity = Number(b.dataset.cap);
  document.querySelectorAll('[data-cap]').forEach(x => { const on=x===b; x.classList.toggle('selected',on); x.setAttribute('aria-pressed',String(on)); });
});
document.querySelectorAll('[data-deck]').forEach(b => b.addEventListener('click', e => {
  const viewButton = e.target.closest('[data-view-deck]');
  if (viewButton) { e.stopPropagation(); openDeckViewer(viewButton.dataset.viewDeck); return; }
  selectDeck(b.dataset.deck);
}));
document.querySelectorAll('[data-view-deck]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); openDeckViewer(b.dataset.viewDeck); }));
$('closeCardModal').onclick = closeDeckViewer;
$('cardModal').addEventListener('click', e => { if (e.target === $('cardModal')) closeDeckViewer(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('cardModal').hidden) closeDeckViewer(); });
$('cardSearch').addEventListener('input', renderCards);
$('cardTypeFilter').addEventListener('change', renderCards);

$('createRoom').onclick = () => {
  $('createRoom').disabled = true;
  socket.emit('room:create', { playerName: playerName('createPlayer'), roomName: $('roomName').value, maxPlayers: selectedCapacity, isPrivate: $('privateRoom').checked, deckId: selectedDeck }, result => {
    $('createRoom').disabled = false;
    if (!result?.ok) return toast(result?.error || 'สร้างห้องไม่สำเร็จ');
    enterRoom(result.room);
  });
};
$('joinRoom').onclick = join;
$('roomCode').addEventListener('input', e => e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6));
$('roomCode').addEventListener('keydown', e => { if (e.key === 'Enter') join(); });
function join() {
  const code = $('roomCode').value.trim();
  if (code.length !== 6) return toast('กรุณากรอกรหัสห้องให้ครบ 6 หลัก');
  $('joinRoom').disabled = true;
  socket.emit('room:join', { code, playerName: playerName('joinPlayer'), deckId: $('joinDeckSelect').value }, result => {
    $('joinRoom').disabled = false;
    if (!result?.ok) return toast(result?.error || 'เข้าร่วมห้องไม่สำเร็จ');
    enterRoom(result.room);
  });
}
function enterRoom(room) { currentRoom = room; $('profileName').textContent = room.players.find(p => p.id === socket.id)?.name || 'ผู้เล่น'; renderRoom(room); show('lobby'); }
socket.on('room:update', room => { if (currentRoom && currentRoom.code === room.code) { currentRoom = room; renderRoom(room); } });
function renderRoom(room) {
  $('lobbyTitle').textContent = room.name; $('lobbyCode').textContent = room.code;
  $('playerCount').textContent = `${room.players.length}/${room.maxPlayers}`;
  const slots = [];
  room.players.forEach(p => slots.push(`<div class="player-card"><div class="player-icon">♟</div><div class="player-name">${escapeHtml(p.name)}${p.host ? '<span class="host-tag">HOST</span>' : ''}</div><div class="player-deck">${escapeHtml(decks[p.deckId]?.name || 'ยังไม่เลือกเด็ค')}</div></div>`));
  for (let i=room.players.length;i<room.maxPlayers;i++) slots.push('<div class="empty-slot">รอผู้เล่น...</div>');
  $('players').innerHTML = slots.join('');
  $('waitingText').textContent = room.players.length >= room.maxPlayers ? 'ผู้เล่นครบแล้ว!' : 'กำลังรอเพื่อนเข้าร่วม...';
}
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
$('copyCode').onclick = async () => { try { await navigator.clipboard.writeText(currentRoom.code); toast('คัดลอกรหัสห้องแล้ว'); } catch { toast(`รหัสห้อง: ${currentRoom.code}`); } };
$('leaveRoom').onclick = () => { socket.emit('room:leave'); currentRoom = null; show('home'); toast('ออกจากห้องแล้ว'); };
socket.on('connect_error', () => toast('เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ'));
