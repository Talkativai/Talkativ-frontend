import { useState, useEffect, useMemo } from 'react';
import T from '../../../utils/tokens';
import { api } from '../../../api.js';
import TopBar from '../TopBar';

export default function PageMenu({ user, agentName, bizName }) {
  const displayAgent = agentName || 'your agent';
  const [categories, setCategories] = useState([]);
  const [activeCatId, setActiveCatId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Integration menu (read-only, live pull)
  const [integrationMenu, setIntegrationMenu] = useState(null);
  const [integrationLoading, setIntegrationLoading] = useState(false);


  // Add item modal
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemCatId, setNewItemCatId] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [addingItem, setAddingItem] = useState(false);
  const [itemError, setItemError] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemDesc, setEditItemDesc] = useState('');
  const [editItemPrice, setEditItemPrice] = useState('');
  const [savingItem, setSavingItem] = useState(false);
  const [editItemError, setEditItemError] = useState('');

  // Add category modal
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [addingCat, setAddingCat] = useState(false);
  const [catError, setCatError] = useState('');

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const loadIntegrationMenu = async () => {
    setIntegrationLoading(true);
    try {
      const data = await api.menu.getLiveIntegration();
      setIntegrationMenu(data?.source ? data : null);
    } catch {
      setIntegrationMenu(null);
    }
    setIntegrationLoading(false);
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      const cats = await api.menu.getCategories();
      setCategories(cats || []);
      if (cats?.length > 0) setActiveCatId(id => id || cats[0].id);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
    loadIntegrationMenu();
  }, []);

  useEffect(() => {
    if (!activeCatId) { setItems([]); return; }
    // Integration-only categories have no DB record — skip the API call entirely
    if (activeCatId.startsWith('__int__')) { setItems([]); return; }
    setLoadingItems(true);
    api.menu.getCategoryItems(activeCatId)
      .then(d => { setItems(d || []); setLoadingItems(false); })
      .catch(() => { setItems([]); setLoadingItems(false); });
  }, [activeCatId]);

  const activeCat = categories.find(c => c.id === activeCatId)
    || (activeCatId?.startsWith('__int__') ? { name: activeCatId.replace('__int__', '') } : null);

  // Merge DB categories with integration categories for the sidebar
  // - Matching categories (same name): merge item counts
  // - Integration-only categories: added as new entries
  const allCategories = useMemo(() => {
    const result = categories.map(c => ({ ...c }));
    if (integrationMenu?.categories?.length) {
      for (const intCat of integrationMenu.categories) {
        const existing = result.find(c => c.name.toLowerCase() === intCat.name.toLowerCase());
        if (existing) {
          // Add integration item count (de-duplicated by name)
          const dbNames = new Set((existing._itemNames || []).map(n => n.toLowerCase()));
          const newCount = intCat.items.filter(i => !dbNames.has(i.name.toLowerCase())).length;
          existing._intItemCount = newCount;
          existing._count = { items: (existing._count?.items || 0) + newCount };
        } else {
          result.push({
            id: `__int__${intCat.name}`,
            name: intCat.name,
            _count: { items: intCat.items.length },
            _integrationOnly: true,
          });
        }
      }
    }
    return result;
  }, [categories, integrationMenu]);

  // Integration items for the active category (de-duplicated against DB items)
  const integrationItemsForActive = useMemo(() => {
    if (!integrationMenu?.categories || !activeCatId) return [];
    const catName = activeCat?.name || '';
    const intCat = integrationMenu.categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
    if (!intCat) return [];
    const dbNames = new Set(items.map(i => i.name.toLowerCase()));
    return intCat.items
      .filter(i => !dbNames.has(i.name.toLowerCase()))
      .map(i => ({ ...i, _source: integrationMenu.source, _readonly: true }));
  }, [integrationMenu, activeCatId, activeCat, items]);

  const totalItemCount = useMemo(
    () => allCategories.reduce((sum, c) => sum + (c._count?.items || 0), 0),
    [allCategories],
  );

  // All items to display (DB items first, then integration additions)
  const allItems = useMemo(() => [...items, ...integrationItemsForActive], [items, integrationItemsForActive]);

  const catEmoji = (name) => {
    const n = (name || '').toLowerCase();
    if (n.includes('pizza')) return '🍕';
    if (n.includes('pasta') || n.includes('noodle')) return '🍝';
    if (n.includes('drink') || n.includes('beverage') || n.includes('juice') || n.includes('coffee')) return '🥤';
    if (n.includes('dessert') || n.includes('sweet') || n.includes('cake')) return '🍰';
    if (n.includes('side') || n.includes('salad')) return '🥗';
    if (n.includes('burger') || n.includes('sandwich')) return '🍔';
    if (n.includes('chicken')) return '🍗';
    if (n.includes('fish') || n.includes('seafood')) return '🐟';
    if (n.includes('starter') || n.includes('appetizer')) return '🥣';
    return '🍽️';
  };

  const fmtPrice = (p) => p != null ? `£${Number(p).toFixed(2)}` : '';

  const syncAgent = () => { api.agent.rebuildPrompt().catch(() => {}); };

  const handleAddItem = async () => {
    const catId = newItemCatId || activeCatId;
    if (!catId || !newItemName || !newItemPrice) return;
    setAddingItem(true); setItemError('');
    try {
      await api.menu.createItem({ categoryId: catId, name: newItemName, description: newItemDesc, price: parseFloat(newItemPrice) });
      setShowAddItem(false); setNewItemName(''); setNewItemDesc(''); setNewItemPrice(''); setItemError('');
      if (catId === activeCatId) {
        const d = await api.menu.getCategoryItems(activeCatId);
        setItems(d || []);
      }
      await loadCategories();
      syncAgent();
    } catch (e) { setItemError(e.message || 'Failed to save item. Please try again.'); }
    setAddingItem(false);
  };

  const handleDeleteItem = async (id) => {
    try {
      await api.menu.deleteItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
      setCategories(prev => prev.map(c => c.id === activeCatId ? { ...c, _count: { ...c._count, items: (c._count?.items || 1) - 1 } } : c));
    } catch {}
  };

  const openEditItem = (item) => { setEditingItem(item); setEditItemName(item.name); setEditItemDesc(item.description || ''); setEditItemPrice(String(item.price)); setEditItemError(''); };
  const closeEditItem = () => { setEditingItem(null); setEditItemName(''); setEditItemDesc(''); setEditItemPrice(''); setEditItemError(''); };
  const handleSaveItem = async () => {
    if (!editItemName || !editItemPrice) return;
    setSavingItem(true); setEditItemError('');
    try {
      const updated = await api.menu.updateItem(editingItem.id, { name: editItemName.trim(), description: editItemDesc.trim() || null, price: parseFloat(editItemPrice) });
      setItems(prev => prev.map(i => i.id === editingItem.id ? updated : i));
      closeEditItem();
      syncAgent();
    } catch (e) { setEditItemError(e.message || 'Failed to save changes. Please try again.'); }
    setSavingItem(false);
  };

  const handleAddCategory = async () => {
    if (!newCatName) return;
    setAddingCat(true); setCatError('');
    try {
      const cat = await api.menu.createCategory({ name: newCatName });
      setNewCatName(''); setShowAddCat(false); setCatError('');
      await loadCategories();
      setActiveCatId(cat.id);
      syncAgent();
    } catch (e) { setCatError(e.message || 'Failed to create category. Please try again.'); }
    setAddingCat(false);
  };

  const inputStyle = { width:"100%", padding:"12px 16px", border:`1.5px solid ${T.line}`, borderRadius:12, background:T.paper, color:T.ink, fontSize:14, fontFamily:"'Outfit',sans-serif", outline:"none", boxSizing:"border-box" };
  const modalOverlay = { position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:24 };
  const modalBox = { position:"relative", width:"100%", background:T.white, border:`1.5px solid ${T.line}`, borderRadius:22, boxShadow:`0 24px 80px rgba(134,87,255,.18)`, animation:"fadeUp .3s ease both" };

  return (
    <>
      <TopBar title={<>Menu <strong>Manager</strong></>} subtitle={`Items ${displayAgent} knows and can take orders for`} user={user} agentName={agentName}>
        {integrationMenu?.source && (
          <button className="btn-secondary" style={{fontSize:13,padding:"8px 16px"}} onClick={loadIntegrationMenu} disabled={integrationLoading}>
            {integrationLoading ? '↻ Syncing…' : `↻ Refresh ${integrationMenu.source}`}
          </button>
        )}
        <button className="btn-primary" style={{fontSize:13,padding:"9px 18px"}} onClick={()=>{ setNewItemCatId(activeCatId); setShowAddItem(true); }}>+ Add item</button>
      </TopBar>

      {integrationMenu?.source && (
        <div style={{background:"#F0F9FF",border:"1.5px solid #BAE6FD",borderRadius:12,padding:"10px 16px",marginBottom:16,fontSize:13,color:"#0369A1",display:"flex",alignItems:"center",gap:8}}>
          <span>🔗</span>
          <span>Some items are synced live from <strong>{integrationMenu.source}</strong> — to edit or remove them, update your {integrationMenu.source} dashboard.</span>
        </div>
      )}

      {loading ? (
        <div style={{textAlign:"center",padding:"80px 20px"}}>
          <div style={{fontSize:36,marginBottom:12}}>🍽️</div>
          <div style={{fontSize:14,color:T.soft}}>Loading menu…</div>
        </div>
      ) : allCategories.length === 0 ? (
        <div className="card" style={{textAlign:"center",padding:"64px 32px"}}>
          <div style={{fontSize:48,marginBottom:16}}>🍽️</div>
          <div style={{fontSize:18,fontWeight:700,color:T.ink,marginBottom:8}}>No menu added yet</div>
          <div style={{fontSize:14,color:T.soft,marginBottom:28,lineHeight:1.6,maxWidth:400,margin:"0 auto 28px"}}>
            Add your menu items manually or import from a URL or file.<br/>
            {displayAgent} will use your menu to answer questions and take orders.
          </div>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="btn-primary" style={{fontSize:13,padding:"11px 24px"}} onClick={()=>setShowAddCat(true)}>+ Add manually</button>
          </div>
        </div>
      ) : (
        <>
          {isMobile && (
            <div style={{display:"flex",gap:6,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
              {allCategories.map(c=>(
                <button key={c.id} onClick={()=>setActiveCatId(c.id)} style={{padding:"7px 16px",borderRadius:50,border:`1.5px solid ${activeCatId===c.id?T.p500:T.line}`,background:activeCatId===c.id?T.p50:"transparent",color:activeCatId===c.id?T.p700:T.mid,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif",whiteSpace:"nowrap",flexShrink:0}}>
                  {c.name}{c._integrationOnly&&<span style={{fontSize:10,marginLeft:4,opacity:.7}}>🔗</span>} <span style={{fontSize:11,color:activeCatId===c.id?T.p400:T.faint}}>({c._count?.items||0})</span>
                </button>
              ))}
            </div>
          )}

          <div className="resp-grid-sidebar-left">
            {!isMobile && (
              <div className="card" style={{padding:16,height:"fit-content"}}>
                <div style={{fontSize:11,fontWeight:700,color:T.soft,textTransform:"uppercase",letterSpacing:".8px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span>Categories</span>
                  <span style={{fontWeight:500,fontSize:11,color:T.faint}}>{totalItemCount} items</span>
                </div>
                {allCategories.map(c=>(
                  <div key={c.id} onClick={()=>setActiveCatId(c.id)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",borderRadius:10,cursor:"pointer",fontSize:13.5,fontWeight:500,color:activeCatId===c.id?T.p700:T.mid,background:activeCatId===c.id?T.p50:"transparent",border:`1.5px solid ${activeCatId===c.id?T.p100:"transparent"}`,marginBottom:2,transition:"all .18s"}}>
                    <span>{c.name}{c._integrationOnly&&<span style={{fontSize:10,marginLeft:5,opacity:.65}}>🔗</span>}</span>
                    <span style={{fontSize:11,color:activeCatId===c.id?T.p400:T.faint}}>{c._count?.items||0}</span>
                  </div>
                ))}
                <div style={{marginTop:16,paddingTop:16,borderTop:`1px solid ${T.line}`}}>
                  <div onClick={()=>setShowAddCat(true)} style={{padding:"10px 12px",borderRadius:10,cursor:"pointer",fontSize:13.5,fontWeight:500,color:T.mid,border:`1.5px dashed ${T.line}`,textAlign:"center"}}>+ Add category</div>
                </div>
              </div>
            )}

            <div className="card">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
                <div className="card-head" style={{marginBottom:0}}>{activeCat?.name || ''}</div>
                <div style={{fontSize:12,color:T.soft}}>{allItems.length} items{integrationItemsForActive.length>0&&<span style={{color:"#0369A1",marginLeft:6}}>({integrationItemsForActive.length} from {integrationMenu?.source})</span>}</div>
              </div>

              {loadingItems ? (
                <div style={{textAlign:"center",padding:"32px",color:T.soft,fontSize:13}}>Loading items…</div>
              ) : allItems.length === 0 ? (
                <div style={{textAlign:"center",padding:"40px 20px"}}>
                  <div style={{fontSize:32,marginBottom:10}}>{catEmoji(activeCat?.name)}</div>
                  <div style={{fontSize:14,fontWeight:600,color:T.ink,marginBottom:6}}>No items in {activeCat?.name}</div>
                  <div style={{fontSize:13,color:T.soft,marginBottom:16}}>Add items manually or import from a menu source</div>
                  <button className="btn-primary" style={{fontSize:13,padding:"9px 20px"}} onClick={()=>{ setNewItemCatId(activeCatId); setShowAddItem(true); }}>+ Add item</button>
                </div>
              ) : isMobile ? (
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {allItems.map((item,idx)=>(
                    <div key={item.id||`int-${idx}`} style={{background:item._readonly?"#F0F9FF":T.paper,border:`1.5px solid ${item._readonly?"#BAE6FD":T.line}`,borderRadius:14,padding:"14px 16px"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{width:36,height:36,borderRadius:10,background:item._readonly?"#E0F2FE":T.p50,border:`1.5px solid ${item._readonly?"#BAE6FD":T.p100}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{catEmoji(activeCat?.name)}</div>
                          <div>
                            <div style={{fontSize:14,fontWeight:600,color:T.ink}}>{item.name}</div>
                            {item._source&&<span style={{fontSize:10,background:"#BAE6FD",color:"#0369A1",borderRadius:4,padding:"1px 5px",fontWeight:700}}>{item._source}</span>}
                          </div>
                        </div>
                        <div style={{fontSize:15,fontWeight:700,color:T.p600}}>{fmtPrice(item.price)}</div>
                      </div>
                      {item.description && <div style={{fontSize:12,color:T.soft,marginBottom:10,paddingLeft:46}}>{item.description}</div>}
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:8,borderTop:`1px solid ${T.line}`}}>
                        {item._readonly
                          ? <span style={{fontSize:12,color:"#0369A1"}}>🔒 Managed in {item._source}</span>
                          : <>
                              <span className={`badge ${item.status==='INACTIVE'?'badge-amber':item.status==='OUT_OF_STOCK'?'badge-amber':'badge-green'}`}>{item.status==='OUT_OF_STOCK'?'Out of stock':item.status==='INACTIVE'?'Inactive':'Active'}</span>
                              <div style={{display:"flex",gap:6}}>
                                <button className="btn-secondary" style={{fontSize:12,padding:"5px 12px"}} onClick={()=>openEditItem(item)}>Edit</button>
                                <button className="btn-danger" style={{fontSize:12,padding:"5px 12px"}} onClick={()=>handleDeleteItem(item.id)}>Remove</button>
                              </div>
                            </>
                        }
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {allItems.map((item,idx)=>(
                    <div key={item.id||`int-${idx}`} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 0",borderBottom:`1px solid ${T.paper}`,background:item._readonly?"#F8FCFF":"transparent",borderRadius:item._readonly?8:0,paddingLeft:item._readonly?8:0,paddingRight:item._readonly?8:0}}>
                      <div style={{width:42,height:42,borderRadius:12,background:item._readonly?"#E0F2FE":T.p50,border:`1.5px solid ${item._readonly?"#BAE6FD":T.p100}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{catEmoji(activeCat?.name)}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <span style={{fontSize:14,fontWeight:600,color:T.ink}}>{item.name}</span>
                          {item._source&&<span style={{fontSize:10,background:"#BAE6FD",color:"#0369A1",borderRadius:4,padding:"1px 6px",fontWeight:700}}>{item._source}</span>}
                        </div>
                        {item.description && <div style={{fontSize:12,color:T.soft,marginTop:2}}>{item.description}</div>}
                      </div>
                      <div style={{fontSize:15,fontWeight:700,color:T.p600,minWidth:60,textAlign:"right"}}>{fmtPrice(item.price)}</div>
                      {item._readonly
                        ? <span style={{fontSize:12,color:"#0369A1",whiteSpace:"nowrap"}}>🔒 Read-only</span>
                        : <>
                            <span className={`badge ${item.status==='INACTIVE'?'badge-amber':item.status==='OUT_OF_STOCK'?'badge-amber':'badge-green'}`}>{item.status==='OUT_OF_STOCK'?'Out of stock':item.status==='INACTIVE'?'Inactive':'Active'}</span>
                            <div style={{display:"flex",gap:6}}>
                              <button className="btn-secondary" style={{fontSize:12,padding:"5px 12px"}} onClick={()=>openEditItem(item)}>Edit</button>
                              <button className="btn-danger" style={{fontSize:12,padding:"5px 12px"}} onClick={()=>handleDeleteItem(item.id)}>Remove</button>
                            </div>
                          </>
                      }
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Add Item Modal ── */}
      {showAddItem && (
        <div style={modalOverlay} onClick={()=>{ setShowAddItem(false); setItemError(''); }}>
          <div style={{position:"absolute",inset:0,background:"rgba(19,13,46,.45)",backdropFilter:"blur(6px)"}}/>
          <div onClick={e=>e.stopPropagation()} style={{...modalBox, maxWidth:440}}>
            <div style={{padding:"24px 28px 18px",borderBottom:`1px solid ${T.line}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,color:T.ink,margin:0}}>Add item</h3>
              <button onClick={()=>{ setShowAddItem(false); setItemError(''); }} style={{width:32,height:32,borderRadius:"50%",border:`1.5px solid ${T.line}`,background:T.paper,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,color:T.mid}}>✕</button>
            </div>
            <div style={{padding:"20px 28px 24px",display:"flex",flexDirection:"column",gap:12}}>
              {categories.length > 0 && (
                <select value={newItemCatId||''} onChange={e=>setNewItemCatId(e.target.value)} style={inputStyle}>
                  {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
              <input value={newItemName} onChange={e=>{ setNewItemName(e.target.value); setItemError(''); }} placeholder="Item name *" style={inputStyle}/>
              <input value={newItemDesc} onChange={e=>setNewItemDesc(e.target.value)} placeholder="Description (optional)" style={inputStyle}/>
              <input value={newItemPrice} onChange={e=>{ setNewItemPrice(e.target.value); setItemError(''); }} placeholder="Price e.g. 12.50 *" type="number" min="0" step="0.01" style={inputStyle}/>
              {itemError && <div style={{fontSize:12,color:T.red,background:T.redBg,border:`1px solid ${T.red}`,borderRadius:8,padding:"8px 12px"}}>{itemError}</div>}
              <button className="btn-primary" style={{width:"100%",justifyContent:"center",padding:"12px",fontSize:14}} disabled={addingItem||!newItemName||!newItemPrice} onClick={handleAddItem}>{addingItem?"Adding…":"Add item"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Item Modal ── */}
      {editingItem && (
        <div style={modalOverlay} onClick={closeEditItem}>
          <div style={{position:"absolute",inset:0,background:"rgba(19,13,46,.45)",backdropFilter:"blur(6px)"}}/>
          <div onClick={e=>e.stopPropagation()} style={{...modalBox, maxWidth:440}}>
            <div style={{padding:"24px 28px 18px",borderBottom:`1px solid ${T.line}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,color:T.ink,margin:0}}>Edit item</h3>
              <button onClick={closeEditItem} style={{width:32,height:32,borderRadius:"50%",border:`1.5px solid ${T.line}`,background:T.paper,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,color:T.mid}}>✕</button>
            </div>
            <div style={{padding:"20px 28px 24px",display:"flex",flexDirection:"column",gap:12}}>
              <input value={editItemName} onChange={e=>{ setEditItemName(e.target.value); setEditItemError(''); }} placeholder="Item name *" style={inputStyle}/>
              <input value={editItemDesc} onChange={e=>setEditItemDesc(e.target.value)} placeholder="Description (optional)" style={inputStyle}/>
              <input value={editItemPrice} onChange={e=>{ setEditItemPrice(e.target.value); setEditItemError(''); }} placeholder="Price e.g. 12.50 *" type="number" min="0" step="0.01" style={inputStyle}/>
              {editItemError && <div style={{fontSize:12,color:T.red,background:T.redBg,border:`1px solid ${T.red}`,borderRadius:8,padding:"8px 12px"}}>{editItemError}</div>}
              <button className="btn-primary" style={{width:"100%",justifyContent:"center",padding:"12px",fontSize:14}} disabled={savingItem||!editItemName||!editItemPrice} onClick={handleSaveItem}>{savingItem?"Saving…":"Save changes"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Category Modal ── */}
      {showAddCat && (
        <div style={modalOverlay} onClick={()=>{ setShowAddCat(false); setCatError(''); }}>
          <div style={{position:"absolute",inset:0,background:"rgba(19,13,46,.45)",backdropFilter:"blur(6px)"}}/>
          <div onClick={e=>e.stopPropagation()} style={{...modalBox, maxWidth:380}}>
            <div style={{padding:"24px 28px 18px",borderBottom:`1px solid ${T.line}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,color:T.ink,margin:0}}>Add category</h3>
              <button onClick={()=>{ setShowAddCat(false); setCatError(''); }} style={{width:32,height:32,borderRadius:"50%",border:`1.5px solid ${T.line}`,background:T.paper,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,color:T.mid}}>✕</button>
            </div>
            <div style={{padding:"20px 28px 24px",display:"flex",flexDirection:"column",gap:12}}>
              <input value={newCatName} onChange={e=>{ setNewCatName(e.target.value); setCatError(''); }} placeholder="e.g. Starters, Mains, Desserts" style={inputStyle} onKeyDown={e=>e.key==='Enter'&&!addingCat&&newCatName&&handleAddCategory()}/>
              {catError && <div style={{fontSize:12,color:T.red,background:T.redBg,border:`1px solid ${T.red}`,borderRadius:8,padding:"8px 12px"}}>{catError}</div>}
              <button className="btn-primary" style={{width:"100%",justifyContent:"center",padding:"12px",fontSize:14}} disabled={addingCat||!newCatName} onClick={handleAddCategory}>{addingCat?"Creating…":"Create category"}</button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
