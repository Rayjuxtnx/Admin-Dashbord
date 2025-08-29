
CREATE TABLE "public"."manual_till_payments" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "mpesa_code" character varying NOT NULL,
    "customer_name" character varying,
    "customer_phone" character varying,
    "amount" numeric,
    "payment_time" character varying,
    "status" character varying DEFAULT 'pending'::character varying
);

ALTER TABLE "public"."manual_till_payments" OWNER TO "postgres";

CREATE SEQUENCE "public"."manual_till_payments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."manual_till_payments_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."manual_till_payments_id_seq" OWNED BY "public"."manual_till_payments"."id";

ALTER TABLE ONLY "public"."manual_till_payments" ALTER COLUMN "id" SET DEFAULT nextval('public.manual_till_payments_id_seq'::regclass);

ALTER TABLE ONLY "public"."manual_till_payments"
    ADD CONSTRAINT "manual_till_payments_pkey" PRIMARY KEY ("id");

ALTER TABLE "public"."manual_till_payments" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON "public"."manual_till_payments" FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON "public"."manual_till_payments" FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for service_role" ON "public"."manual_till_payments" FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Enable delete for service_role" ON "public"."manual_till_payments" FOR DELETE USING (auth.role() = 'service_role');
