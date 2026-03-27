const verificationBody = 'tiktokZk7IR9cqiNIblCJiC2zDp2IEtkCkwdgt';

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
