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
  currency?: string;
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
    language: '',
    timezone: '',
    connectionType: '',
    internetSpeed: '',
  };

  if (typeof window === 'undefined') return info;

  // Screen & language
  info.screenResolution = `${window.screen.width}x${window.screen.height}`;
  info.language = navigator.language;
  info.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Device type
  const ua = navigator.userAgent;
  info.deviceType = /mobile/i.test(ua) ? 'mobile' : /tablet/i.test(ua) ? 'tablet' : 'desktop';

  // Browser detection
  if (ua.includes('Firefox/')) {
    info.browser = 'Firefox';
    info.browserVersion = ua.match(/Firefox\/(\d+)/)?.[1] || '';
  } else if (ua.includes('Edg/')) {
    info.browser = 'Microsoft Edge';
    info.browserVersion = ua.match(/Edg\/(\d+)/)?.[1] || '';
  } else if (ua.includes('Chrome/')) {
    info.browser = 'Chrome';
    info.browserVersion = ua.match(/Chrome\/(\d+)/)?.[1] || '';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    info.browser = 'Safari';
    info.browserVersion = ua.match(/Version\/(\d+)/)?.[1] || '';
  } else {
    info.browser = 'Unknown';
    info.browserVersion = '';
  }

  // OS detection
  if (ua.includes('Windows NT 10')) {
    info.os = 'Windows';
    info.osVersion = '10/11';
  } else if (ua.includes('Windows NT')) {
    info.os = 'Windows';
    info.osVersion = 'Older';
  } else if (ua.includes('Mac OS X')) {
    info.os = 'macOS';
    info.osVersion = ua.match(/Mac OS X (\d+[._]\d+)/)?.[1]?.replace('_', '.') || '';
  } else if (ua.includes('Linux')) {
    info.os = 'Linux';
    info.osVersion = '';
  } else if (ua.includes('Android')) {
    info.os = 'Android';
    info.osVersion = ua.match(/Android (\d+)/)?.[1] || '';
  } else if (ua.includes('iPhone') || ua.includes('iPad')) {
    info.os = 'iOS';
    info.osVersion = ua.match(/OS (\d+)/)?.[1] || '';
  } else {
    info.os = 'Unknown';
    info.osVersion = '';
  }

  // Connection info
  const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (conn) {
    info.connectionType = conn.effectiveType || conn.type || '';
    info.internetSpeed = conn.downlink ? `${conn.downlink} Mbps` : '';
  }

  // IP & location via free API
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
      info.latitude = data.latitude;
      info.longitude = data.longitude;
      info.location = [info.city, info.region, info.country].filter(Boolean).join(', ');
    }
  } catch (e) {
    // Try fallback
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
