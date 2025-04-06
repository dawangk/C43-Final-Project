CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() 
);



CREATE TABLE FriendRequest(
	incoming_id INT NOT NULL,
	to_id INT NOT NULL,
	status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')), 
	created_at TIMESTAMP DEFAULT NOW(), 
	FOREIGN KEY(incoming_id) REFERENCES Users(user_id) ON DELETE CASCADE, 
	FOREIGN KEY(to_id) REFERENCES Users(user_id) ON DELETE CASCADE, 
	CONSTRAINT unique_friend_request PRIMARY KEY(incoming_id, to_id)
);

CREATE TABLE Friendship(
	user1_id INT NOT NULL,
	user2_id INT NOT NULL,
	created_at TIMESTAMP DEFAULT NOW(), 
	FOREIGN KEY(user1_id) REFERENCES Users(user_id) ON DELETE CASCADE, 
	FOREIGN KEY(user2_id) REFERENCES Users(user_id) ON DELETE CASCADE, 
	CHECK (user1_id < user2_id)
);

CREATE TABLE StockList(
	sl_id SERIAL PRIMARY KEY, 
	user_id INT NOT NULL, 
	name TEXT NOT NULL, 
	visibility VARCHAR(20) NOT NULL CHECK (visibility IN ('private', 'shared', 'public')) DEFAULT 'private',
    created_at TIMESTAMP DEFAULT NOW(), 
	CONSTRAINT unique_stock_list_name UNIQUE(user_id, name)
);

CREATE TABLE Portfolio(
	user_id INT NOT NULL, 
	sl_id INT NOT NULL,
	port_id SERIAL PRIMARY KEY, 
	cash_account MONEY NOT NULL DEFAULT 0, 
	name TEXT NOT NULL, 
	created_at TIMESTAMP DEFAULT NOW(), 
	FOREIGN KEY(user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
	FOREIGN KEY(sl_id) REFERENCES StockList(sl_id) ON DELETE CASCADE, 
	CONSTRAINT unique_port_name UNIQUE(user_id, name)
);

CREATE TABLE StockOwned(
	sl_id INT NOT NULL, 
	symbol VARCHAR(5) NOT NULL, 
	amount INT CHECK (amount > 0), 
  created_at TIMESTAMP DEFAULT NOW(), 
  updated_at TIMESTAMP DEFAULT NOW(), 
	PRIMARY KEY (sl_id, symbol),
	FOREIGN KEY(sl_id) REFERENCES StockList(sl_id) ON DELETE CASCADE
);

CREATE TABLE Stock(
  symbol VARCHAR(5) PRIMARY KEY
);

CREATE TABLE CreatorOfP(
	user_id INT NOT NULL, 
	port_id INT NOT NULL, 
	PRIMARY KEY (user_id, port_id), 
	FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
	FOREIGN KEY (port_id) REFERENCES Portfolio(port_id) ON DELETE CASCADE
);

CREATE TABLE CreatorOfSL(
	user_id INT NOT NULL, 
	sl_id INT NOT NULL, 
	PRIMARY KEY (user_id, sl_id), 
	FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
	FOREIGN KEY (sl_id) REFERENCES StockList(sl_id) ON DELETE CASCADE
);

CREATE TABLE UserReview(
	user_id INT NOT NULL, 
	sl_id INT NOT NULL, 
	content TEXT,
	PRIMARY KEY (user_id, sl_id), 
	FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
	FOREIGN KEY (sl_id) REFERENCES StockList(sl_id) ON DELETE CASCADE
);


CREATE TABLE Share(
    sl_id INT NOT NULL,
    user_id INT NOT NULL, 
    FOREIGN KEY (sl_id) REFERENCES StockList(sl_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);


CREATE TABLE SLOfP(
    port_id INT NOT NULL, 
    sl_id INT NOT NULL,
    FOREIGN KEY (port_id) REFERENCES Portfolio(port_id) ON DELETE CASCADE, 
    FOREIGN KEY (sl_id) REFERENCES StockList(sl_id) ON DELETE CASCADE
);

CREATE TABLE RecordedStockPerformance (
    port_id INT NOT NULL, 
    symbol VARCHAR(5) NOT NULL, 
    timestamp DATE, 
    open REAL, 
    high REAL, 
    low REAL, 
    close REAL, 
    volume INT, 
    PRIMARY KEY (port_id, symbol, timestamp)
);


CREATE TABLE HistoricalStockPerformance (
    symbol VARCHAR(5) NOT NULL, 
    timestamp DATE, 
    open REAL, 
    high REAL, 
    low REAL, 
    close REAL, 
    volume INT, 
    PRIMARY KEY (symbol, timestamp)
);

-- Allows us to directly fetch the max timestamp per symbol (without sorting)
CREATE INDEX idx_symbol_timestamp_desc ON HistoricalStockPerformance(symbol, timestamp DESC);

-- Supports year-ago lookups (especially for large spans)
CREATE INDEX idx_symbol_timestamp ON HistoricalStockPerformance(symbol, timestamp);


COPY HistoricalStockPerformance(timestamp, open, high, low, close, volume, symbol) FROM 'C:\Users\kevin\Downloads\SP500History.csv' DELIMITER ',' CSV HEADER;

INSERT INTO stock(symbol) select distinct symbol from HistoricalStockPerformance;