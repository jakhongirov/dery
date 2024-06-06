CREATE TABLE admins (
   admin_id bigserial PRIMARY KEY,
   admin_email text not null,
   admin_password text not null,
   admin_create_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
   user_id bigserial PRIMARY KEY,
   user_name text not null,
   user_phone text not null,
   user_gender text not null,
   user_chat_id text not null,
   user_referral_bonus text,
   user_referral_bonus_image_url text,
   user_referral_bonus_image_name text,
   user_personal text,
   user_personal_code_image_url text,
   user_personal_code_image_name text,
   user_lang text,
   user_cashbek int DEFAULT 0,
   user_create_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users_relationship (
   id bigserial PRIMARY KEY,
   relationship_name text,
   relationship_birthday text,
   user_id int REFERENCES users(user_id) ON DELETE CASCADE,
   relationship_create_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
   category_id bigserial PRIMARY KEY,
   category_name_uz text not null,
   category_name_ru text not null,
   category_create_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
   product_id bigserial PRIMARY KEY,
   product_name_uz text not null,
   product_name_ru text not null,
   product_description_uz text not null,
   product_description_ru text not null,
   product_price int not null,
   product_image_url text,
   product_image_name text,
   category_id int REFERENCES categories(category_id) ON DELETE CASCADE,
   product_create_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE news (
   news_id bigserial PRIMARY KEY,
   news_title_uz text not null,
   news_title_ru text not null,
   news_description_uz text not null,
   news_description_ru text not null,
   news_image_url text,
   news_image_name text,
   news_create_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
   order_id bigserial PRIMARY KEY,
   order_product_id int [],
   user_id int REFERENCES users(user_id) ON DELETE CASCADE,
   order_total_price int,
   order_started boolean DEFAULT false,
   order_finished boolean DEFAULT false,
   order_create_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
   review_id bigserial PRIMARY KEY,
   review text not null,
   user_id int REFERENCES users(user_id) ON DELETE CASCADE,
   review_create_at timestamptz DEFAULT CURRENT_TIMESTAMP
);