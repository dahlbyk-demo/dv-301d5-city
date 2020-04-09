CREATE TABLE IF NOT EXISTS Books (
  Id SERIAL PRIMARY KEY,
  Title VARCHAR(100) NOT NULL,
  Author VARCHAR(500) NOT NULL,
  Genre VARCHAR(1000),
  IsCheckedOut BOOLEAN NOT NULL DEFAULT(FALSE),
  Rating NUMERIC(5,2),
  DatePurchased DATE
);

CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    search_query VARCHAR(255),
    formatted_query VARCHAR(255),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7)
  );
