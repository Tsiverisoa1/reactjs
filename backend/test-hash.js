// test-hash.js
const bcrypt = require('bcrypt');

async function run() {
  const password = 'admin123'; // mot de passe que tu veux
  const hash = await bcrypt.hash(password, 10);
  console.log(hash);
}

run();
{/* Lien mot de passe oublié */}
<div className="text-center mt-4">
<button className="text-sm text-indigo-600 hover:underline">
  Mot de passe oublié ?
</button>
</div>