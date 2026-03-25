import { useState, useEffect, useCallback } from "react";
import { 
  collection, query, orderBy, onSnapshot, 
  addDoc, serverTimestamp, doc, setDoc, getDocs, limit, where 
} from "firebase/firestore";
import { db, auth } from "@/firebase";

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: any;
  status: "sent" | "delivered" | "seen";
}

export interface ChatRoom {
  id: string;
  name: string;
  isDirectMessage: boolean;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: any;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  online: boolean;
  lastSeen: any;
  photoURL?: string;
}

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeUsers: UserProfile[] = [];
      snapshot.forEach((doc) => {
        if (doc.id !== auth.currentUser?.uid) {
          activeUsers.push({ id: doc.id, ...doc.data() } as UserProfile);
        }
      });
      setUsers(activeUsers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { users, loading };
}

export function useRooms() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    // In a real app we'd query rooms where participants array contains current userId
    // For this clone, let's just fetch all global rooms and specific DMs
    const q = query(
      collection(db, "rooms"),
      orderBy("lastMessageTime", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedRooms: ChatRoom[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as ChatRoom;
        // Filter: either public or I'm a participant
        if (!data.participants || data.participants.includes(auth.currentUser!.uid)) {
          loadedRooms.push({ ...data, id: docSnap.id });
        }
      });
      setRooms(loadedRooms);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching rooms:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createOrCreateDMRoom = async (otherUserId: string, otherUserName: string) => {
    if (!auth.currentUser) return null;
    const currentId = auth.currentUser.uid;
    
    // Create a predictable ID for DMs
    const roomId = currentId < otherUserId 
      ? `${currentId}_${otherUserId}` 
      : `${otherUserId}_${currentId}`;

    const roomRef = doc(db, "rooms", roomId);
    await setDoc(roomRef, {
      name: `DM: ${otherUserName}`,
      isDirectMessage: true,
      participants: [currentId, otherUserId],
      lastMessageTime: serverTimestamp()
    }, { merge: true });

    return roomId;
  };

  return { rooms, loading, createOrCreateDMRoom };
}

export function useMessages(roomId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, `rooms/${roomId}/messages`),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages: Message[] = [];
      snapshot.forEach((doc) => {
        loadedMessages.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(loadedMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId]);

  const sendMessage = useCallback(async (text: string) => {
    if (!roomId || !auth.currentUser || !text.trim()) return;

    try {
      const currentId = auth.currentUser.uid;
      const currentName = auth.currentUser.displayName || auth.currentUser.email?.split("@")[0] || "User";

      await addDoc(collection(db, `rooms/${roomId}/messages`), {
        text: text.trim(),
        senderId: currentId,
        senderName: currentName,
        timestamp: serverTimestamp(),
        status: "sent"
      });

      // Update room's last message
      await setDoc(doc(db, "rooms", roomId), {
        lastMessage: text.trim(),
        lastMessageTime: serverTimestamp()
      }, { merge: true });

    } catch (error) {
      console.error("Error sending message:", error);
    }
  }, [roomId]);

  return { messages, loading, sendMessage };
}
