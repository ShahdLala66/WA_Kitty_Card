import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  where,
  serverTimestamp 
} from "firebase/firestore";
import { auth, db } from "./config";

export const saveGameResult = async (playerName, score, isWinner = false, gameId = null) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User must be logged in to save score");
    }

    if (gameId) {
      const duplicateQuery = query(
        collection(db, "leaderboard"),
        where("gameId", "==", gameId),
        where("userId", "==", user.uid)
      );
      const duplicateSnapshot = await getDocs(duplicateQuery);
      
      if (!duplicateSnapshot.empty) {
        console.log("Score already saved for this game");
        return { success: true, alreadySaved: true };
      }
    }

    const gameResult = {
      userId: user.uid,
      email: user.email,
      displayName: user.displayName || playerName,
      playerName: playerName,
      score: score,
      isWinner: isWinner,
      gameId: gameId || `game_${Date.now()}`,
      timestamp: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "leaderboard"), gameResult);
    return { success: true, id: docRef.id, alreadySaved: false };
  } catch (error) {
    console.error("Error saving game result:", error);
    return { success: false, error: error.message };
  }
};

export const saveAllPlayersScores = async (players, gameId, winnerName) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User must be logged in");
    }

    const results = [];
    for (const player of players) {
      const isWinner = player.name === winnerName;
      const result = await saveGameResult(
        player.name, 
        player.score, 
        isWinner, 
        gameId
      );
      results.push(result);
    }

    return { success: true, results };
  } catch (error) {
    console.error("Error saving all players scores:", error);
    return { success: false, error: error.message };
  }
};

export const getTopScores = async (limitCount = 10) => {
  try {
    const q = query(
      collection(db, "leaderboard"),
      orderBy("score", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const scores = [];
    
    querySnapshot.forEach((doc) => {
      scores.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return { success: true, scores };
  } catch (error) {
    console.error("Error fetching top scores:", error);
    return { success: false, error: error.message, scores: [] };
  }
};

export const getUserScores = async (userId = null) => {
  try {
    const targetUserId = userId || auth.currentUser?.uid;
    if (!targetUserId) {
      throw new Error("No user ID provided");
    }

    const q = query(
      collection(db, "leaderboard"),
      where("userId", "==", targetUserId),
      orderBy("score", "desc"),
      limit(10)
    );

    const querySnapshot = await getDocs(q);
    const scores = [];
    
    querySnapshot.forEach((doc) => {
      scores.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return { success: true, scores };
  } catch (error) {
    console.error("Error fetching user scores:", error);
    return { success: false, error: error.message, scores: [] };
  }
};

export const getRecentGames = async (limitCount = 20) => {
  try {
    const q = query(
      collection(db, "leaderboard"),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const games = [];
    
    querySnapshot.forEach((doc) => {
      games.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return { success: true, games };
  } catch (error) {
    console.error("Error fetching recent games:", error);
    return { success: false, error: error.message, games: [] };
  }
};

export const getAverageScores = async () => {
  try {
    const q = query(collection(db, "leaderboard"));
    const querySnapshot = await getDocs(q);
    
    const scoresByEmail = {};
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const email = data.email;
      
      if (!email) return;
      
      if (!scoresByEmail[email]) {
        scoresByEmail[email] = {
          email,
          displayName: data.displayName || data.playerName,
          scores: [],
          totalScore: 0,
          gameCount: 0
        };
      }
      
      scoresByEmail[email].scores.push(data.score);
      scoresByEmail[email].totalScore += data.score;
      scoresByEmail[email].gameCount += 1;
    });
    
    const averageScores = Object.values(scoresByEmail)
      .map(player => ({
        email: player.email,
        displayName: player.displayName,
        playerName: player.displayName,
        gameCount: player.gameCount,
        totalScore: player.totalScore,
        averageScore: Math.round(player.totalScore / player.gameCount * 10) / 10
      }))
      .sort((a, b) => b.averageScore - a.averageScore);
    
    return { success: true, scores: averageScores };
  } catch (error) {
    console.error("Error fetching average scores:", error);
    return { success: false, error: error.message, scores: [] };
  }
};
