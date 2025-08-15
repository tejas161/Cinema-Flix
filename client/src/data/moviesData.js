// Enhanced movie database with IMDB-style comprehensive data
export const moviesDatabase = [
  {
    id: 1,
    title: "Spider-Man: No Way Home",
    poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    backdrop: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    rating: "8.2",
    imdbRating: "8.2/10",
    genres: ["Action", "Adventure", "Sci-Fi"],
    duration: "148 min",
    runtime: 148,
    language: "English",
    languages: ["English", "Spanish"],
    releaseDate: "2021-12-17",
    director: "Jon Watts",
    cast: [
      { name: "Tom Holland", character: "Peter Parker / Spider-Man", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
      { name: "Zendaya", character: "MJ", image: "https://images.unsplash.com/photo-1494790108755-2616b332c2cd?w=150" },
      { name: "Benedict Cumberbatch", character: "Dr. Stephen Strange", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" },
      { name: "Jacob Batalon", character: "Ned Leeds", image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150" }
    ],
    plot: "With Spider-Man's identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear, forcing Peter to discover what it truly means to be Spider-Man.",
    trailer: "https://www.youtube.com/watch?v=JfVOs4VSpmA",
    status: "now-playing",
    certification: "PG-13",
    budget: "$200,000,000",
    boxOffice: "$1.921 billion",
    production: "Columbia Pictures, Marvel Studios",
    showTimes: ["10:00 AM", "1:30 PM", "4:45 PM", "8:15 PM", "11:30 PM"]
  },
  {
    id: 2,
    title: "The Batman",
    poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    backdrop: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    rating: "7.8",
    imdbRating: "7.8/10",
    genres: ["Action", "Crime", "Drama"],
    duration: "176 min",
    runtime: 176,
    language: "English",
    languages: ["English"],
    releaseDate: "2022-03-04",
    director: "Matt Reeves",
    cast: [
      { name: "Robert Pattinson", character: "Bruce Wayne / Batman", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" },
      { name: "Zoë Kravitz", character: "Selina Kyle / Catwoman", image: "https://images.unsplash.com/photo-1494790108755-2616b332c2cd?w=150" },
      { name: "Paul Dano", character: "Edward Nashton / Riddler", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
      { name: "Jeffrey Wright", character: "James Gordon", image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150" }
    ],
    plot: "When a killer targets Gotham's elite with a series of sadistic machinations, a trail of cryptic clues sends the World's Greatest Detective on an investigation into the underworld.",
    trailer: "https://www.youtube.com/watch?v=mqqft2x_Aa4",
    status: "now-playing",
    certification: "PG-13",
    budget: "$185,000,000",
    boxOffice: "$771 million",
    production: "Warner Bros. Pictures",
    showTimes: ["11:00 AM", "2:45 PM", "6:30 PM", "10:15 PM"]
  },
  {
    id: 3,
    title: "Top Gun: Maverick",
    poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    backdrop: "https://images.unsplash.com/photo-1544198365-f5d60b6d8190?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    rating: "8.3",
    imdbRating: "8.3/10",
    genres: ["Action", "Drama"],
    duration: "130 min",
    runtime: 130,
    language: "English",
    languages: ["English"],
    releaseDate: "2022-05-27",
    director: "Joseph Kosinski",
    cast: [
      { name: "Tom Cruise", character: "Pete 'Maverick' Mitchell", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
      { name: "Miles Teller", character: "Bradley 'Rooster' Bradshaw", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" },
      { name: "Jennifer Connelly", character: "Penny Benjamin", image: "https://images.unsplash.com/photo-1494790108755-2616b332c2cd?w=150" },
      { name: "Jon Hamm", character: "Cyclone", image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150" }
    ],
    plot: "After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past when he leads TOP GUN's elite graduates on a mission that demands the ultimate sacrifice.",
    trailer: "https://www.youtube.com/watch?v=giXco2jaZ_4",
    status: "now-playing",
    certification: "PG-13",
    budget: "$170,000,000",
    boxOffice: "$1.489 billion",
    production: "Paramount Pictures",
    showTimes: ["9:30 AM", "12:15 PM", "3:30 PM", "6:45 PM", "9:45 PM"]
  },
  {
    id: 4,
    title: "Doctor Strange in the Multiverse of Madness",
    poster: "https://images.unsplash.com/photo-1489599611389-c5b8b0fa9dc4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    backdrop: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    rating: "7.0",
    imdbRating: "7.0/10",
    genres: ["Action", "Adventure", "Fantasy"],
    duration: "126 min",
    runtime: 126,
    language: "English",
    languages: ["English"],
    releaseDate: "2022-05-06",
    director: "Sam Raimi",
    cast: [
      { name: "Benedict Cumberbatch", character: "Dr. Stephen Strange", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" },
      { name: "Elizabeth Olsen", character: "Wanda Maximoff", image: "https://images.unsplash.com/photo-1494790108755-2616b332c2cd?w=150" },
      { name: "Chiwetel Ejiofor", character: "Karl Mordo", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
      { name: "Benedict Wong", character: "Wong", image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150" }
    ],
    plot: "Doctor Strange teams up with a mysterious teenage girl from his dreams who can travel across multiverses, to battle multiple threats, including other-universe versions of himself.",
    trailer: "https://www.youtube.com/watch?v=aWzlQ2N6qqg",
    status: "now-playing",
    certification: "PG-13",
    budget: "$200,000,000",
    boxOffice: "$956 million",
    production: "Marvel Studios",
    showTimes: ["10:30 AM", "1:45 PM", "5:00 PM", "8:30 PM"]
  },
  {
    id: 5,
    title: "Black Panther: Wakanda Forever",
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    backdrop: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    rating: "7.3",
    imdbRating: "7.3/10",
    genres: ["Action", "Adventure", "Sci-Fi"],
    duration: "161 min",
    runtime: 161,
    language: "English",
    languages: ["English", "Xhosa"],
    releaseDate: "2022-11-11",
    director: "Ryan Coogler",
    cast: [
      { name: "Angela Bassett", character: "Queen Ramonda", image: "https://images.unsplash.com/photo-1494790108755-2616b332c2cd?w=150" },
      { name: "Letitia Wright", character: "Shuri", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
      { name: "Lupita Nyong'o", character: "Nakia", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" },
      { name: "Danai Gurira", character: "Okoye", image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150" }
    ],
    plot: "The people of Wakanda fight to protect their home from intervening world powers as they mourn the death of King T'Challa.",
    trailer: "https://www.youtube.com/watch?v=_Z3QKkl1WyM",
    status: "coming-soon",
    certification: "PG-13",
    budget: "$250,000,000",
    boxOffice: "$859 million",
    production: "Marvel Studios",
    showTimes: ["Coming Soon"]
  },
  {
    id: 6,
    title: "Avatar: The Way of Water",
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    backdrop: "https://images.unsplash.com/photo-1544198365-f5d60b6d8190?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    rating: "7.9",
    imdbRating: "7.9/10",
    genres: ["Action", "Adventure", "Sci-Fi"],
    duration: "192 min",
    runtime: 192,
    language: "English",
    languages: ["English", "Na'vi"],
    releaseDate: "2022-12-16",
    director: "James Cameron",
    cast: [
      { name: "Sam Worthington", character: "Jake Sully", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
      { name: "Zoe Saldaña", character: "Neytiri", image: "https://images.unsplash.com/photo-1494790108755-2616b332c2cd?w=150" },
      { name: "Sigourney Weaver", character: "Kiri", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" },
      { name: "Stephen Lang", character: "Colonel Quatrich", image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150" }
    ],
    plot: "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na'vi race to protect their home.",
    trailer: "https://www.youtube.com/watch?v=d9MyW72ELq0",
    status: "coming-soon",
    certification: "PG-13",
    budget: "$460,000,000",
    boxOffice: "$2.320 billion",
    production: "20th Century Studios",
    showTimes: ["Coming Soon"]
  },
  {
    id: 7,
    title: "Everything Everywhere All at Once",
    poster: "https://images.unsplash.com/photo-1489599611389-c5b8b0fa9dc4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    backdrop: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    rating: "7.8",
    imdbRating: "7.8/10",
    genres: ["Action", "Adventure", "Comedy"],
    duration: "139 min",
    runtime: 139,
    language: "English",
    languages: ["English", "Mandarin", "Cantonese"],
    releaseDate: "2022-03-25",
    director: "Daniels",
    cast: [
      { name: "Michelle Yeoh", character: "Evelyn Quan Wang", image: "https://images.unsplash.com/photo-1494790108755-2616b332c2cd?w=150" },
      { name: "Stephanie Hsu", character: "Joy Wang / Jobu Tupaki", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
      { name: "Ke Huy Quan", character: "Waymond Wang", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" },
      { name: "Jamie Lee Curtis", character: "Deirdre Beaubeirdre", image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150" }
    ],
    plot: "A Chinese-American woman, who must connect with parallel universe versions of herself to prevent a powerful being from destroying the multiverse.",
    trailer: "https://www.youtube.com/watch?v=wxN1T1uxQ2g",
    status: "trending",
    certification: "R",
    budget: "$14,300,000",
    boxOffice: "$143 million",
    production: "A24",
    showTimes: ["11:15 AM", "2:30 PM", "5:45 PM", "9:00 PM"]
  },
  {
    id: 8,
    title: "Dune",
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    backdrop: "https://images.unsplash.com/photo-1544198365-f5d60b6d8190?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    rating: "8.0",
    imdbRating: "8.0/10",
    genres: ["Action", "Adventure", "Drama"],
    duration: "155 min",
    runtime: 155,
    language: "English",
    languages: ["English"],
    releaseDate: "2021-10-22",
    director: "Denis Villeneuve",
    cast: [
      { name: "Timothée Chalamet", character: "Paul Atreides", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
      { name: "Rebecca Ferguson", character: "Lady Jessica", image: "https://images.unsplash.com/photo-1494790108755-2616b332c2cd?w=150" },
      { name: "Oscar Isaac", character: "Duke Leto Atreides", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" },
      { name: "Josh Brolin", character: "Gurney Halleck", image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150" }
    ],
    plot: "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people.",
    trailer: "https://www.youtube.com/watch?v=n9xhJrPXop4",
    status: "trending",
    certification: "PG-13",
    budget: "$165,000,000",
    boxOffice: "$402 million",
    production: "Warner Bros. Pictures",
    showTimes: ["10:45 AM", "2:15 PM", "6:00 PM", "9:30 PM"]
  }
];

// Filter functions for different categories
export const getNowPlayingMovies = () => moviesDatabase.filter(movie => movie.status === 'now-playing');
export const getComingSoonMovies = () => moviesDatabase.filter(movie => movie.status === 'coming-soon');
export const getTrendingMovies = () => moviesDatabase.filter(movie => movie.status === 'trending');
export const getAllMovies = () => moviesDatabase;

// Get movie by ID
export const getMovieById = (id) => moviesDatabase.find(movie => movie.id === parseInt(id));

// Search movies
export const searchMovies = (query) => {
  if (!query) return moviesDatabase;
  const lowercaseQuery = query.toLowerCase();
  return moviesDatabase.filter(movie => 
    movie.title.toLowerCase().includes(lowercaseQuery) ||
    movie.director.toLowerCase().includes(lowercaseQuery) ||
    movie.genres.some(genre => genre.toLowerCase().includes(lowercaseQuery)) ||
    movie.cast.some(actor => actor.name.toLowerCase().includes(lowercaseQuery))
  );
};

// Filter movies by genre
export const filterByGenre = (genre) => {
  if (!genre || genre === 'All') return moviesDatabase;
  return moviesDatabase.filter(movie => movie.genres.includes(genre));
};

// Get all unique genres
export const getAllGenres = () => {
  const genres = new Set();
  moviesDatabase.forEach(movie => {
    movie.genres.forEach(genre => genres.add(genre));
  });
  return ['All', ...Array.from(genres).sort()];
};
