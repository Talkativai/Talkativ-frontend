import { VS_DAY_KEYS, VS_DAY_LABELS } from "../utils/schedule";

const T = {
  ivory: "#FDFCFA", white: "#FFFFFF", paper: "#F8F6FF", mist: "#F2EEFF",
  frost: "#EAE4FF", lavBlue: "#E0D9FF",
  p50: "#F5F2FF", p100: "#ECE5FF", p200: "#D9CEFF", p300: "#BBA8FF",
  p400: "#9E7EFF", p500: "#8657FF", p600: "#7035F5", p700: "#5E24D8", p800: "#4B1AB5",
  ink: "#130D2E", ink2: "#2D2150", mid: "#6B5E8A", soft: "#9E92BA",
  faint: "#C8C0DC", line: "#EBE6F5",
  green: "#22C55E", greenBg: "#F0FDF4", greenBd: "#BBF7D0",
  red: "#EF4444", redBg: "#FEF2F2", amber: "#F59E0B",
};

export default function ScheduleInlineEditor({ is24h, setIs24h, schedule, setSchedule }) {
  return (
    <div style={{marginTop:12}}>
      <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:12}}>
        <input type="checkbox" checked={is24h} onChange={e=>setIs24h(e.target.checked)} style={{accentColor:T.p600,width:15,height:15}}/>
        <span style={{fontSize:13,fontWeight:600,color:T.ink}}>We operate 24/7</span>
      </label>
      {!is24h && (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {VS_DAY_KEYS.map(day=>(
            <div key={day} style={{display:"flex",alignItems:"center",gap:10}}>
              <label style={{display:"flex",alignItems:"center",gap:7,width:54,cursor:"pointer",flexShrink:0}}>
                <input type="checkbox" checked={schedule[day]?.open||false} onChange={()=>setSchedule(p=>({...p,[day]:{...p[day],open:!p[day].open}}))} style={{accentColor:T.p600}}/>
                <span style={{fontSize:13,fontWeight:600,color:T.ink}}>{VS_DAY_LABELS[day]}</span>
              </label>
              {schedule[day]?.open ? (
                <div style={{display:"flex",alignItems:"center",gap:6,flex:1}}>
                  <input type="time" value={schedule[day].openTime} onChange={e=>setSchedule(p=>({...p,[day]:{...p[day],openTime:e.target.value}}))} style={{flex:1,padding:"6px 8px",border:`1.5px solid ${T.line}`,borderRadius:8,fontSize:12.5,fontFamily:"'Outfit',sans-serif",color:T.ink,background:T.white,outline:"none"}}/>
                  <span style={{color:T.soft,fontSize:13}}>–</span>
                  <input type="time" value={schedule[day].closeTime} onChange={e=>setSchedule(p=>({...p,[day]:{...p[day],closeTime:e.target.value}}))} style={{flex:1,padding:"6px 8px",border:`1.5px solid ${T.line}`,borderRadius:8,fontSize:12.5,fontFamily:"'Outfit',sans-serif",color:T.ink,background:T.white,outline:"none"}}/>
                </div>
              ) : (
                <span style={{fontSize:12,color:T.soft,marginLeft:4}}>Closed</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
