import { CONFIG } from './shared/config';

export function Brand({ small }: { small?: boolean }) {
  return (
    <div className="brand" style={small ? { marginBottom: 4 } : undefined}>
      <div className="logo" style={small ? { fontSize: 24 } : undefined}>
        VER<em>DICT</em>
      </div>
      {!small && <div className="tagline">{CONFIG.TAGLINE}</div>}
    </div>
  );
}
