const bcrypt = require("bcryptjs");
const senha = "escolha-uma-senha-forte-aqui";

bcrypt.hash(senha, 10).then((hash) => {
  console.log(hash);
});