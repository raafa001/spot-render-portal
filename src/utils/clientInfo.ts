export interface ClientInfo {
  ip: string;
  location: string;
  isp: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  screenResolution: string;
  language: string;
  timezone: string;
  connectionType: string;
  internetSpeed: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  currency?: string;
}

export function formatClientInfo(info: ClientInfo): string {
  const lines = [
    `🌐 **Informações do seu dispositivo**`,
    ``,
    `📍 **Localização:** ${info.location || 'Desconhecida'}`,
    `🔢 **IP:** ${info.ip || 'Não identificado'}`,
    `🏢 **Operadora:** ${info.isp || 'Não identificada'}`,
    `📶 **Velocidade:** ${info.internetSpeed || 'Não medida'}`,
    `📱 **Tipo:** ${info.deviceType === 'mobile' ? 'Celular' : info.deviceType === 'tablet' ? 'Tablet' : 'Computador'}`,
    `🖥️ **Sistema:** ${info.os}${info.osVersion ? ` ${info.osVersion}` : ''}`,
    `🌐 **Navegador:** ${info.browser}${info.browserVersion ? ` ${info.browserVersion}` : ''}`,
    `🗣️ **Idioma:** ${info.language}`,
    `⏰ **Fuso horário:** ${info.timezone}`,
    `📐 **Tela:** ${info.screenResolution}`,
  ];

  return lines.join('\n');
}

export function formatClientInfoHtml(info: ClientInfo): string {
  return `
    <div class="device-info">
      <h4>📱 Informações do Dispositivo</h4>
      <ul>
        <li><strong>Localização:</strong> ${info.location || 'Desconhecida'}</li>
        <li><strong>IP:</strong> ${info.ip || 'Não identificado'}</li>
        <li><strong>Operadora:</strong> ${info.isp || 'Não identificada'}</li>
        <li><strong>Velocidade:</strong> ${info.internetSpeed || 'Não medida'}</li>
        <li><strong>Tipo:</strong> ${info.deviceType === 'mobile' ? '📱 Celular' : info.deviceType === 'tablet' ? '📱 Tablet' : '💻 Computador'}</li>
        <li><strong>Sistema:</strong> ${info.os}${info.osVersion ? ` ${info.osVersion}` : ''}</li>
        <li><strong>Navegador:</strong> ${info.browser}${info.browserVersion ? ` ${info.browserVersion}` : ''}</li>
        <li><strong>Idioma:</strong> ${info.language}</li>
        <li><strong>Fuso:</strong> ${info.timezone}</li>
        <li><strong>Tela:</strong> ${info.screenResolution}</li>
      </ul>
    </div>
  `;
}

export function getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/mobile/i.test(ua)) return 'mobile';
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  return 'desktop';
}

export function getBrowser(): { name: string; version: string } {
  if (typeof window === 'undefined') return { name: 'Unknown', version: '' };

  const ua = navigator.userAgent;
  if (ua.includes('Firefox/')) {
    return { name: 'Firefox', version: ua.match(/Firefox\/(\d+)/)?.[1] || '' };
  }
  if (ua.includes('Edg/')) {
    return { name: 'Microsoft Edge', version: ua.match(/Edg\/(\d+)/)?.[1] || '' };
  }
  if (ua.includes('Chrome/')) {
    return { name: 'Chrome', version: ua.match(/Chrome\/(\d+)/)?.[1] || '' };
  }
  if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    return { name: 'Safari', version: ua.match(/Version\/(\d+)/)?.[1] || '' };
  }
  return { name: 'Unknown', version: '' };
}

export function getOS(): { name: string; version: string } {
  if (typeof window === 'undefined') return { name: 'Unknown', version: '' };

  const ua = navigator.userAgent;
  if (ua.includes('Windows NT 10')) return { name: 'Windows', version: '10/11' };
  if (ua.includes('Windows NT')) return { name: 'Windows', version: 'Older' };
  if (ua.includes('Mac OS X')) {
    return { name: 'macOS', version: ua.match(/Mac OS X (\d+[._]\d+)/)?.[1]?.replace('_', '.') || '' };
  }
  if (ua.includes('Linux')) return { name: 'Linux', version: '' };
  if (ua.includes('Android')) return { name: 'Android', version: ua.match(/Android (\d+)/)?.[1] || '' };
  if (ua.includes('iPhone') || ua.includes('iPad')) return { name: 'iOS', version: ua.match(/OS (\d+)/)?.[1] || '' };
  return { name: 'Unknown', version: '' };
}

export function getConnectionInfo(): { type: string; downlink: string } {
  const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (!conn) return { type: '', downlink: '' };
  return {
    type: conn.effectiveType || conn.type || '',
    downlink: conn.downlink ? `${conn.downlink} Mbps` : '',
  };
}

export async function getClientInfo(): Promise<ClientInfo> {
  const info: ClientInfo = {
    ip: '',
    location: '',
    isp: '',
    deviceType: 'desktop',
    browser: '',
    browserVersion: '',
    os: '',
    osVersion: '',
    screenResolution: '',
    language: navigator.language || 'pt-BR',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    connectionType: '',
    internetSpeed: '',
  };

  if (typeof window === 'undefined') return info;

  info.screenResolution = `${window.screen.width}x${window.screen.height}`;
  info.deviceType = getDeviceType();

  const browser = getBrowser();
  info.browser = browser.name;
  info.browserVersion = browser.version;

  const os = getOS();
  info.os = os.name;
  info.osVersion = os.version;

  const conn = getConnectionInfo();
  info.connectionType = conn.type;
  info.internetSpeed = conn.downlink;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeout);
    if (response.ok) {
      const data = await response.json();
      info.ip = data.ip || '';
      info.isp = data.org || '';
      info.city = data.city || '';
      info.region = data.region || '';
      info.country = data.country_name || '';
      info.countryCode = data.country_code || '';
      info.latitude = data.latitude;
      info.longitude = data.longitude;
      info.location = [info.city, info.region, info.country].filter(Boolean).join(', ');

      const langMap: Record<string, string> = {
        'BR': 'pt-BR',
        'US': 'en-US',
        'GB': 'en-US',
        'ES': 'es-ES',
        'MX': 'es-ES',
        'AR': 'es-ES',
      };
      info.language = langMap[data.country_code] || info.language;
    }
  } catch {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const fallback = await fetch('https://ipapi.co/json/', { signal: controller.signal });
      clearTimeout(timeout);
      if (fallback.ok) {
        const data = await fallback.json();
        info.ip = data.ip || '';
        info.isp = data.org || '';
        info.location = data.city ? `${data.city}, ${data.country}` : data.country || '';
      }
    } catch {
      info.ip = 'Unable to determine';
      info.location = 'Unknown';
      info.isp = 'Unknown';
    }
  }

  return info;
}
