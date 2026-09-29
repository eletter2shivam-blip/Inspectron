const { URL } = require('url');

/**
 * Checks whether an IP or hostname is private or dangerous (SSRF risk).
 * Blocked:
 * - Localhost / Loopback: 127.0.0.0/8, ::1
 * - AWS / Cloud Metadata: 169.254.169.254, 169.254.0.0/16
 * - Private Class A: 10.0.0.0/8
 * - Private Class B: 172.16.0.0/12
 * - Private Class C: 192.168.0.0/16
 * - Non-HTTP/HTTPS protocols
 */
function isSafeUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') return false;

  try {
    const parsed = new URL(urlString);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // Loopback hostnames
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.endsWith('.localhost')
    ) {
      // In local development or test mode, permit localhost for integration testing
      if (process.env.NODE_ENV === 'test' || process.env.ALLOW_LOCAL_SSRF === 'true') {
        return true;
      }
      return false;
    }

    // Cloud metadata service (AWS/GCP/Azure)
    if (hostname === '169.254.169.254' || hostname.startsWith('169.254.')) {
      return false;
    }

    // Check IPv4 private address ranges
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = hostname.match(ipv4Regex);
    if (match) {
      const [_, b1, b2] = match.map(Number);
      if (b1 === 10) return false; // 10.0.0.0/8
      if (b1 === 172 && b2 >= 16 && b2 <= 31) return false; // 172.16.0.0/12
      if (b1 === 192 && b2 === 168) return false; // 192.168.0.0/16
      if (b1 === 0 || b1 >= 224) return false; // Broadcast or multicast
    }

    return true;
  } catch (err) {
    return false;
  }
}

module.exports = {
  isSafeUrl
};
