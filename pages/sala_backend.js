// sala_backend.js
// Lógica de backend para manipulação de salas e convites
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, updateDoc, arrayUnion, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBUxLcOvtCClJ0XMAXsDQusme7PS7Xeo9g",
  authDomain: "callppo.firebaseapp.com",
  projectId: "callppo",
  storageBucket: "callppo.firebasestorage.app",
  messagingSenderId: "631386689899",
  appId: "1:631386689899:web:6fca2231e749797458bc2e",
  measurementId: "G-4N3FPFY63T"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Função para gerar código de sala aleatório
function gerarCodigoSala() {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789'; // Evita confusão entre 0/O e I/1
  let codigo = '';
  for (let i = 0; i < 8; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
}

// Criar uma nova sala
async function criarSala(nome, capacidade = 50, configuracoes = {}) {
  const usuario = auth.currentUser;
  if (!usuario) {
    throw new Error("Usuário não autenticado");
  }

  // Configurações padrão da sala
  const configPadrao = {
    require_approval: false,
    allow_code_join: true,
    show_code_publicly: false,
    calendar_permissions: "admins_only",
    chat_open: true,
    auto_suspension: {
      enabled: true,
      threshold_messages: 5,
      within_seconds: 10,
      suspension_seconds: 60
    },
    discoverable: false
  };

  const configFinal = { ...configPadrao, ...configuracoes };
  const codigoSala = gerarCodigoSala();

  const sala = {
    nome: nome,
    ownerId: usuario.uid,
    capacidade: capacidade,
    codigo: codigoSala,
    configuracoes: configFinal,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  try {
    // Criar documento da sala
    const docSala = await addDoc(collection(db, "rooms"), sala);
    
    // Adicionar usuário como administrador da sala
    await adicionarUsuarioASala(usuario.uid, docSala.id, "admin");
    
    return {
      id: docSala.id,
      ...sala
    };
  } catch (error) {
    console.error("Erro ao criar sala:", error);
    throw error;
  }
}

// Adicionar usuário a uma sala
async function adicionarUsuarioASala(userId, roomId, role = "member") {
  const membership = {
    userId: userId,
    roomId: roomId,
    role: role,
    status: "active",
    joinedAt: new Date()
  };

  try {
    await addDoc(collection(db, "memberships"), membership);
  } catch (error) {
    console.error("Erro ao adicionar usuário à sala:", error);
    throw error;
  }
}

// Verificar se usuário pertence a uma sala
async function usuarioPertenceASala(userId, roomId) {
  try {
    const q = query(
      collection(db, "memberships"),
      where("userId", "==", userId),
      where("roomId", "==", roomId)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Erro ao verificar pertencimento à sala:", error);
    return false;
  }
}

// Obter salas de um usuário
async function obterSalasDoUsuario(userId) {
  try {
    const q = query(
      collection(db, "memberships"),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    
    const salas = [];
    for (const doc of querySnapshot.docs) {
      const membership = doc.data();
      if (membership.status === "active") {
        const salaDoc = await getDoc(doc(db, "rooms", membership.roomId));
        if (salaDoc.exists()) {
          salas.push({
            membershipId: doc.id,
            roomId: membership.roomId,
            role: membership.role,
            ...salaDoc.data()
          });
        }
      }
    }
    return salas;
  } catch (error) {
    console.error("Erro ao obter salas do usuário:", error);
    return [];
  }
}

// Procurar sala por código
async function procurarSalaPorCodigo(codigo) {
  try {
    const q = query(
      collection(db, "rooms"),
      where("codigo", "==", codigo.toUpperCase())
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error("Erro ao procurar sala por código:", error);
    return null;
  }
}

// Entrar em uma sala por código
async function entrarEmSalaPorCodigo(codigo) {
  const usuario = auth.currentUser;
  if (!usuario) {
    throw new Error("Usuário não autenticado");
  }

  const sala = await procurarSalaPorCodigo(codigo);
  if (!sala) {
    throw new Error("Sala não encontrada");
  }

  // Verificar se o usuário já está na sala
  if (await usuarioPertenceASala(usuario.uid, sala.id)) {
    throw new Error("Usuário já é membro da sala");
  }

  // Verificar capacidade da sala
  const q = query(
    collection(db, "memberships"),
    where("roomId", "==", sala.id)
  );
  const membrosSnapshot = await getDocs(q);
  if (membrosSnapshot.size >= sala.capacidade) {
    throw new Error("Sala atingiu capacidade máxima");
  }

  // Verificar se a sala permite entrada por código
  if (!sala.configuracoes.allow_code_join) {
    throw new Error("Esta sala não permite entrada por código");
  }

  // Determinar status com base na configuração require_approval
  const status = sala.configuracoes.require_approval ? "pending" : "active";

  const membership = {
    userId: usuario.uid,
    roomId: sala.id,
    role: "member",
    status: status,
    joinedAt: new Date()
  };

  try {
    await addDoc(collection(db, "memberships"), membership);
    
    return {
      success: true,
      status: status,
      message: status === "pending" 
        ? "Solicitação enviada. Aguarde confirmação do administrador." 
        : "Você entrou na sala com sucesso!"
    };
  } catch (error) {
    console.error("Erro ao entrar na sala:", error);
    throw error;
  }
}

// Exportar funções
export {
  criarSala,
  adicionarUsuarioASala,
  usuarioPertenceASala,
  obterSalasDoUsuario,
  procurarSalaPorCodigo,
  entrarEmSalaPorCodigo,
  gerarCodigoSala
};