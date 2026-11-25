import{test}from'node:test';import assert from'node:assert/strict';import{routes,sneakerRoutes,total,validProductUrl}from'../web/costs.js';
test('itemized totals include shipping, tax and fees',()=>{assert.equal(total(routes[0]),1393800);assert.equal(total(routes[1]),1550000);assert.equal(total(routes[2]),1452000);assert.equal(total(routes[1])-total(routes[0]),156200)});
test('only product-like HTTP URLs accepted',()=>{for(const u of ['javascript:alert(1)','not-a-url','ftp://example.com/a','https://user:pass@example.com'])assert.equal(validProductUrl(u),false);assert.equal(validProductUrl('https://www.acnestudios.com/product?a=1'),true)});

test('sneaker dummy quotes total all cost components consistently',()=>{assert.deepEqual(sneakerRoutes.map(total),[580000,729000,620000]);assert.equal(total(sneakerRoutes[1])-total(sneakerRoutes[0]),149000)});
