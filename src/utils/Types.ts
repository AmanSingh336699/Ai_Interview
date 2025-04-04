export interface RankedAnswer {
    userId: string;
    question: string;
    answer: string;
  }

export interface User {
    _id: string;
    username: string;
  }

export interface UpdatedRankAnswer {
    username: string;
    question: string;
    answer: string;
  }