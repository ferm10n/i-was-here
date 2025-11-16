CREATE TABLE "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"lat" real NOT NULL,
	"lng" real NOT NULL,
	"revisit" boolean DEFAULT false,
	"note" text,
	"created_by_name" text,
	"created_by_email" text,
	"accuracy" real,
	"address" text
);
