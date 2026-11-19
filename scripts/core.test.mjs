import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeUrl } from "../lib/sanitize.ts";
import { calculateRiskScore, generateScanFindings } from "../lib/threat-data.ts";

test("URL validation rejects malformed, private and credential-bearing targets", () => {
  for (const url of [null, 12, {}, "", "javascript:alert(1)", "ftp://example.com", "http://localhost", "http://localhost.", "http://app.local", "http://127.0.0.1", "http://2130706433", "http://0x7f000001", "http://[::1]", "http://[::ffff:127.0.0.1]", "http://169.254.169.254", "http://192.168.1.1", "http://10.0.0.1", "http://172.16.0.1", "http://172.31.255.255", "https://user:pass@example.com"]) assert.equal(sanitizeUrl(url),null,JSON.stringify(url));
  assert.equal(sanitizeUrl("https://example.com"),"https://example.com/");
  assert.equal(sanitizeUrl("https://example.com/path?test=1"),"https://example.com/path?test=1");
  assert.equal(sanitizeUrl("http://172.15.0.1"),"http://172.15.0.1/");
  assert.equal(sanitizeUrl("http://172.32.0.1"),"http://172.32.0.1/");
});
test("scan profiles limit findings to their check family", () => {
  const ssl=generateScanFindings("https://example.com/","ssl");
  assert(ssl.length>0); assert(ssl.every((finding)=>/TLS|Cipher/.test(finding.title)));
  const headers=generateScanFindings("https://example.com/","headers");
  assert(headers.length>0); assert(headers.every((finding)=>/Header|Disclosure/.test(finding.title)));
  assert.equal(generateScanFindings("https://example.com/","quick").length,2);
  const first=generateScanFindings("https://example.com/","full").map(({title,severity})=>({title,severity}));
  const second=generateScanFindings("https://example.com/","full").map(({title,severity})=>({title,severity}));
  assert.deepEqual(first,second);
});
test("risk scores use severity weights and remain within 0-100", () => {
  assert.equal(calculateRiskScore([]),0);
  assert.equal(calculateRiskScore([{severity:"critical"},{severity:"high"},{severity:"medium"},{severity:"low"},{severity:"info"}]),52);
  assert.equal(calculateRiskScore(Array(20).fill({severity:"critical"})),100);
});
