// sala_backend.js
// Lógica de backend para manipulação de salas e convites
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, updateDoc, doc, deleteDoc, addDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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
      where("userId", "==", userId),
      where("status", "==", "active") // Garante que só traz memberships ativos
    );
    const querySnapshot = await getDocs(q);

    const salas = [];
    for (const membershipDoc of querySnapshot.docs) {
      const membership = membershipDoc.data();
      const salaDoc = await getDoc(doc(db, "rooms", membership.roomId));
      if (salaDoc.exists()) {
        salas.push({
          id: salaDoc.id,
          roomId: membership.roomId,
          role: membership.role,
          ...salaDoc.data()
        });
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

// Função para gerar convite por email
async function gerarConvitePorEmail(roomId, email) {
  const auth = getAuth();
  const usuario = auth.currentUser;
  if (!usuario) throw new Error("Usuário não autenticado");

  // Verifica se o usuário é admin da sala
  // (implemente a verificação conforme sua lógica de memberships)

  const convite = {
    roomId,
    createdBy: usuario.uid,
    email,
    status: "pending",
    createdAt: new Date(),
    expiresAt: null
  };

  const docRef = await addDoc(collection(db, "invites"), convite);
  // Aqui você pode integrar com serviço de email para enviar o link
  return docRef.id;
}

// Função para gerar link de convite único
async function gerarLinkConvite(roomId, opcoes = {}) {
  const auth = getAuth();
  const usuario = auth.currentUser;
  if (!usuario) throw new Error("Usuário não autenticado");

  // Verifica se o usuário é admin da sala

  const token = Math.random().toString(36).substring(2, 12) + Date.now().toString(36);

  const convite = {
    roomId,
    createdBy: usuario.uid,
    token,
    status: "pending",
    createdAt: new Date(),
    expiresAt: opcoes.expiresAt || null,
    maxUses: opcoes.maxUses || 1,
    uses: 0
  };

  await addDoc(collection(db, "invites"), convite);
  return `${window.location.origin}/pages/convite.html?token=${token}`;
}

// Banir usuário da sala
async function banirUsuario(roomId, userId, adminId) {
  const db = getFirestore();
  // Verifica se adminId é admin
  const adminQ = query(collection(db, "memberships"), where("userId", "==", adminId), where("roomId", "==", roomId), where("role", "==", "admin"));
  const adminSnap = await getDocs(adminQ);
  if (adminSnap.empty) throw new Error("Apenas administradores podem banir usuários.");

  // Atualiza status para "banned"
  const userQ = query(collection(db, "memberships"), where("userId", "==", userId), where("roomId", "==", roomId));
  const userSnap = await getDocs(userQ);
  if (userSnap.empty) throw new Error("Usuário não encontrado na sala.");
  const membershipDoc = userSnap.docs[0];
  await updateDoc(doc(db, "memberships", membershipDoc.id), { status: "banned" });
}

// Desbanir usuário da sala
async function desbanirUsuario(roomId, userId, adminId) {
  const db = getFirestore();
  // Verifica se adminId é admin
  const adminQ = query(collection(db, "memberships"), where("userId", "==", adminId), where("roomId", "==", roomId), where("role", "==", "admin"));
  const adminSnap = await getDocs(adminQ);
  if (adminSnap.empty) throw new Error("Apenas administradores podem desbanir usuários.");

  // Atualiza status para "active"
  const userQ = query(collection(db, "memberships"), where("userId", "==", userId), where("roomId", "==", roomId));
  const userSnap = await getDocs(userQ);
  if (userSnap.empty) throw new Error("Usuário não encontrado na sala.");
  const membershipDoc = userSnap.docs[0];
  await updateDoc(doc(db, "memberships", membershipDoc.id), { status: "active" });
}

// Remover mensagem do chat
async function removerMensagem(roomId, messageId, adminId) {
  const db = getFirestore();
  // Verifica se adminId é admin
  const adminQ = query(collection(db, "memberships"), where("userId", "==", adminId), where("roomId", "==", roomId), where("role", "==", "admin"));
  const adminSnap = await getDocs(adminQ);
  if (adminSnap.empty) throw new Error("Apenas administradores podem remover mensagens.");

  await deleteDoc(doc(db, "chat", messageId));
}

// Criar notificação
async function criarNotificacao(userId, roomId, type, title, content) {
  await addDoc(collection(db, "notifications"), {
    userId,
    roomId,
    type,
    title,
    content,
    read: false,
    createdAt: new Date()
  });
}

// Exportar funções
export {
  criarSala,
  adicionarUsuarioASala,
  usuarioPertenceASala,
  obterSalasDoUsuario,
  procurarSalaPorCodigo,
  entrarEmSalaPorCodigo,
  gerarCodigoSala,
  gerarConvitePorEmail,
  gerarLinkConvite,
  banirUsuario,
  desbanirUsuario,
  removerMensagem,
  criarNotificacao
};