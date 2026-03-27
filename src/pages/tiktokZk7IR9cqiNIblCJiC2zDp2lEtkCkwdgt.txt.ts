const verificationBody = 'tiktok-developers-site-verification=Zk7IR9cqiNIblCJiC2zDp2lEtkCkwdgt';

function buildResponse() {
  return new Response(verificationBody, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=300',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

export function GET() {
  return buildResponse();
}

export function HEAD() {
  return buildResponse();
}
