--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4 (Debian 17.4-1.pgdg120+2)
-- Dumped by pg_dump version 17.4

-- Started on 2025-04-22 21:57:42 CEST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 16385)
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- TOC entry 6 (class 2615 OID 16386)
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- TOC entry 244 (class 1255 OID 16387)
-- Name: get_groups(integer); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.get_groups(i_id integer) RETURNS TABLE(id integer, name jsonb, description jsonb, created_at timestamp without time zone, updated_at timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.name, u.description, u.created_at, u.updated_at
  FROM groups u
  WHERE u.id = i_id OR i_id IS NULL;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 16388)
-- Name: accounts; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.accounts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    provider_account_id text NOT NULL,
    provider_id text NOT NULL,
    access_token text,
    refresh_token text,
    access_token_expires_at timestamp with time zone,
    refresh_token_expires_at timestamp with time zone,
    scope character varying(255),
    id_token text,
    is_active boolean DEFAULT true,
    password character varying(255),
    failed_login_attempts integer DEFAULT 0,
    last_login_at timestamp with time zone,
    password_changed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 219 (class 1259 OID 16397)
-- Name: accounts_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3542 (class 0 OID 0)
-- Dependencies: 219
-- Name: accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.accounts_id_seq OWNED BY auth.accounts.id;


--
-- TOC entry 220 (class 1259 OID 16398)
-- Name: audit_logs; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_logs (
    id integer NOT NULL,
    user_id integer,
    event_type character varying(50) NOT NULL,
    resource_type character varying(50),
    resource_id integer,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 221 (class 1259 OID 16404)
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3543 (class 0 OID 0)
-- Dependencies: 221
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.audit_logs_id_seq OWNED BY auth.audit_logs.id;


--
-- TOC entry 222 (class 1259 OID 16405)
-- Name: group_permissions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.group_permissions (
    group_id integer NOT NULL,
    permission_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 223 (class 1259 OID 16409)
-- Name: group_permissions_group_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.group_permissions_group_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3544 (class 0 OID 0)
-- Dependencies: 223
-- Name: group_permissions_group_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.group_permissions_group_id_seq OWNED BY auth.group_permissions.group_id;


--
-- TOC entry 224 (class 1259 OID 16410)
-- Name: groups; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.groups (
    id integer NOT NULL,
    name jsonb NOT NULL,
    description jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 225 (class 1259 OID 16417)
-- Name: groups_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3545 (class 0 OID 0)
-- Dependencies: 225
-- Name: groups_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.groups_id_seq OWNED BY auth.groups.id;


--
-- TOC entry 226 (class 1259 OID 16418)
-- Name: permissions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.permissions (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    resource_id integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 227 (class 1259 OID 16424)
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3546 (class 0 OID 0)
-- Dependencies: 227
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.permissions_id_seq OWNED BY auth.permissions.id;


--
-- TOC entry 228 (class 1259 OID 16425)
-- Name: providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.providers (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    enabled boolean DEFAULT true,
    config jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 229 (class 1259 OID 16433)
-- Name: providers_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.providers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3547 (class 0 OID 0)
-- Dependencies: 229
-- Name: providers_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.providers_id_seq OWNED BY auth.providers.id;


--
-- TOC entry 230 (class 1259 OID 16434)
-- Name: resources; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.resources (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 231 (class 1259 OID 16440)
-- Name: resources_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.resources_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3548 (class 0 OID 0)
-- Dependencies: 231
-- Name: resources_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.resources_id_seq OWNED BY auth.resources.id;


--
-- TOC entry 232 (class 1259 OID 16441)
-- Name: role_permissions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.role_permissions (
    role_id integer NOT NULL,
    permission_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 233 (class 1259 OID 16445)
-- Name: role_permissions_role_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.role_permissions_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3549 (class 0 OID 0)
-- Dependencies: 233
-- Name: role_permissions_role_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.role_permissions_role_id_seq OWNED BY auth.role_permissions.role_id;


--
-- TOC entry 234 (class 1259 OID 16446)
-- Name: roles; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 235 (class 1259 OID 16453)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3550 (class 0 OID 0)
-- Dependencies: 235
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.roles_id_seq OWNED BY auth.roles.id;


--
-- TOC entry 236 (class 1259 OID 16454)
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    ip_address character varying(255),
    user_agent character varying(255),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 237 (class 1259 OID 16461)
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3551 (class 0 OID 0)
-- Dependencies: 237
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.sessions_id_seq OWNED BY auth.sessions.id;


--
-- TOC entry 238 (class 1259 OID 16462)
-- Name: user_groups; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.user_groups (
    user_id integer NOT NULL,
    group_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 239 (class 1259 OID 16466)
-- Name: user_roles; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.user_roles (
    user_id integer NOT NULL,
    role_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 240 (class 1259 OID 16470)
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    id integer NOT NULL,
    full_name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    email_verified boolean DEFAULT false,
    username character varying(50),
    image character varying(255),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone
);


--
-- TOC entry 241 (class 1259 OID 16478)
-- Name: users_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3552 (class 0 OID 0)
-- Dependencies: 241
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.users_id_seq OWNED BY auth.users.id;


--
-- TOC entry 242 (class 1259 OID 16479)
-- Name: verifications; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.verifications (
    id integer NOT NULL,
    identifier character varying(255) NOT NULL,
    value character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 243 (class 1259 OID 16486)
-- Name: verifications_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.verifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3553 (class 0 OID 0)
-- Dependencies: 243
-- Name: verifications_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.verifications_id_seq OWNED BY auth.verifications.id;


--
-- TOC entry 3275 (class 2604 OID 16487)
-- Name: accounts id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.accounts ALTER COLUMN id SET DEFAULT nextval('auth.accounts_id_seq'::regclass);


--
-- TOC entry 3280 (class 2604 OID 16488)
-- Name: audit_logs id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_logs ALTER COLUMN id SET DEFAULT nextval('auth.audit_logs_id_seq'::regclass);


--
-- TOC entry 3282 (class 2604 OID 16489)
-- Name: group_permissions group_id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.group_permissions ALTER COLUMN group_id SET DEFAULT nextval('auth.group_permissions_group_id_seq'::regclass);


--
-- TOC entry 3284 (class 2604 OID 16490)
-- Name: groups id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.groups ALTER COLUMN id SET DEFAULT nextval('auth.groups_id_seq'::regclass);


--
-- TOC entry 3287 (class 2604 OID 16491)
-- Name: permissions id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.permissions ALTER COLUMN id SET DEFAULT nextval('auth.permissions_id_seq'::regclass);


--
-- TOC entry 3289 (class 2604 OID 16492)
-- Name: providers id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.providers ALTER COLUMN id SET DEFAULT nextval('auth.providers_id_seq'::regclass);


--
-- TOC entry 3293 (class 2604 OID 16493)
-- Name: resources id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.resources ALTER COLUMN id SET DEFAULT nextval('auth.resources_id_seq'::regclass);


--
-- TOC entry 3295 (class 2604 OID 16494)
-- Name: role_permissions role_id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.role_permissions ALTER COLUMN role_id SET DEFAULT nextval('auth.role_permissions_role_id_seq'::regclass);


--
-- TOC entry 3297 (class 2604 OID 16495)
-- Name: roles id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.roles ALTER COLUMN id SET DEFAULT nextval('auth.roles_id_seq'::regclass);


--
-- TOC entry 3300 (class 2604 OID 16496)
-- Name: sessions id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions ALTER COLUMN id SET DEFAULT nextval('auth.sessions_id_seq'::regclass);


--
-- TOC entry 3305 (class 2604 OID 16497)
-- Name: users id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users ALTER COLUMN id SET DEFAULT nextval('auth.users_id_seq'::regclass);


--
-- TOC entry 3309 (class 2604 OID 16498)
-- Name: verifications id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.verifications ALTER COLUMN id SET DEFAULT nextval('auth.verifications_id_seq'::regclass);


--
-- TOC entry 3511 (class 0 OID 16388)
-- Dependencies: 218
-- Data for Name: accounts; Type: TABLE DATA; Schema: auth; Owner: -
--

INSERT INTO auth.accounts VALUES (1, 1, '1', 'credential', NULL, NULL, NULL, NULL, NULL, NULL, true, '21c78b9d0e991d9495d478f8de80f422:4099dead21bc42704319cbe3e18f04f823586ecf441a5f22a615b2e8df55a79201c90a0252626fe3033380ccda3ce857bca5c2dbd8289285328334472fcbd94d', 0, NULL, NULL, '2025-04-20 22:38:50.198944+00', '2025-04-20 22:38:50.198944+00');
INSERT INTO auth.accounts VALUES (2, 2, '2', 'credential', NULL, NULL, NULL, NULL, NULL, NULL, true, 'a09e84738ad65d975f84ed5b353a1cf5:ab08162ada5de6f5f1437f9f3b77cba6968cb5194a86b06633b1e931a909e4e0db354155e1443cad9d18a2c4e04ab7ca06c5c7a407b52da1f667f2431e60d110', 0, NULL, NULL, '2025-04-20 22:38:50.226013+00', '2025-04-20 22:38:50.226013+00');
INSERT INTO auth.accounts VALUES (3, 3, '3', 'credential', NULL, NULL, NULL, NULL, NULL, NULL, true, '4173453111c73a77ed717bd65ac6ad0f:119cc2d8c7ef539e322fc3b6e5f1aee109bed04bd8cdc4df5d2e67c3b2f923b2aa809645b1285059b23cf5c2927ea948c1165148eb0aeba2e5c5697ff70d3d0a', 0, NULL, NULL, '2025-04-20 22:38:50.248243+00', '2025-04-20 22:38:50.248243+00');


--
-- TOC entry 3513 (class 0 OID 16398)
-- Dependencies: 220
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- TOC entry 3515 (class 0 OID 16405)
-- Dependencies: 222
-- Data for Name: group_permissions; Type: TABLE DATA; Schema: auth; Owner: -
--

INSERT INTO auth.group_permissions VALUES (1, 1, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (1, 2, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (1, 3, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (1, 4, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (1, 5, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (1, 6, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (1, 7, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (1, 8, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (1, 9, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (1, 10, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (1, 11, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (1, 12, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (1, 13, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (1, 14, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (1, 15, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (1, 16, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (1, 17, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (1, 18, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (1, 19, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (1, 20, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (1, 21, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (2, 1, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (2, 2, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (2, 3, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (2, 5, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (2, 9, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (2, 15, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (2, 16, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (2, 17, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (2, 18, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (2, 19, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (2, 20, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (3, 15, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (3, 16, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (3, 17, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (3, 19, '2025-04-20 22:38:50.196957+00');
INSERT INTO auth.group_permissions VALUES (4, 15, '2025-04-20 22:38:50.196957+00');


--
-- TOC entry 3517 (class 0 OID 16410)
-- Dependencies: 224
-- Data for Name: groups; Type: TABLE DATA; Schema: auth; Owner: -
--

INSERT INTO auth.groups VALUES (1, '{"en": "System Administrator", "hu": "Rendszergazda"}', '{"en": "Users with unlimited permissions who oversee and maintain the entire system", "hu": "Korlátlan jogosultsággal rendelkező felhasználók, akik a teljes rendszert felügyelik és karbantartják"}', '2025-04-20 22:38:50.19021+00', '2025-04-20 22:38:50.19021+00');
INSERT INTO auth.groups VALUES (2, '{"en": "Administrator", "hu": "Adminisztrátor"}', '{"en": "Users with full access who manage users and all administrative functions", "hu": "Teljes hozzáféréssel rendelkező felhasználók, akik kezelhetik a felhasználókat és minden adminisztrációs funkciót elérnek"}', '2025-04-20 22:38:50.19021+00', '2025-04-20 22:38:50.19021+00');
INSERT INTO auth.groups VALUES (3, '{"en": "Content Editor", "hu": "Tartalomszerkesztő"}', '{"en": "Users with the ability to manage public page content, creating new content and editing existing content", "hu": "A publikus oldal tartalmainak kezelésére jogosult felhasználók, akik új tartalmakat hozhatnak létre és szerkeszthetik a meglévőket"}', '2025-04-20 22:38:50.19021+00', '2025-04-20 22:38:50.19021+00');
INSERT INTO auth.groups VALUES (4, '{"en": "General User", "hu": "Általános felhasználó"}', '{"en": "Users with basic access who can use the public features of the page after logging in", "hu": "Alapszintű hozzáférőssel rendelkező felhasználók, akik bejelentkezés után használhatják az oldal publikus funkcióit"}', '2025-04-20 22:38:50.19021+00', '2025-04-20 22:38:50.19021+00');


--
-- TOC entry 3519 (class 0 OID 16418)
-- Dependencies: 226
-- Data for Name: permissions; Type: TABLE DATA; Schema: auth; Owner: -
--

INSERT INTO auth.permissions VALUES (1, 'users:view', 'Felhasználók megtekintése', 1, '2025-04-20 22:38:50.193265+00');
INSERT INTO auth.permissions VALUES (2, 'users:create', 'Felhasználók létrehozása', 1, '2025-04-20 22:38:50.193265+00');
INSERT INTO auth.permissions VALUES (3, 'users:update', 'Felhasználók módosítása', 1, '2025-04-20 22:38:50.193265+00');
INSERT INTO auth.permissions VALUES (4, 'users:delete', 'Felhasználók törlése', 1, '2025-04-20 22:38:50.193265+00');
INSERT INTO auth.permissions VALUES (5, 'groups:view', 'Csoportok megtekintése', 2, '2025-04-20 22:38:50.193265+00');
INSERT INTO auth.permissions VALUES (6, 'groups:create', 'Csoportok létrehozása', 2, '2025-04-20 22:38:50.193265+00');
INSERT INTO auth.permissions VALUES (7, 'groups:update', 'Csoportok módosítása', 2, '2025-04-20 22:38:50.193265+00');
INSERT INTO auth.permissions VALUES (8, 'groups:delete', 'Csoportok törlése', 2, '2025-04-20 22:38:50.193265+00');
INSERT INTO auth.permissions VALUES (9, 'roles:view', 'Szerepkörök megtekintése', 3, '2025-04-20 22:38:50.193265+00');
INSERT INTO auth.permissions VALUES (10, 'roles:create', 'Szerepkörök létrehozása', 3, '2025-04-20 22:38:50.193265+00');
INSERT INTO auth.permissions VALUES (11, 'roles:update', 'Szerepkörök módosítása', 3, '2025-04-20 22:38:50.193265+00');
INSERT INTO auth.permissions VALUES (12, 'roles:delete', 'Szerepkörök törlése', 3, '2025-04-20 22:38:50.193265+00');
INSERT INTO auth.permissions VALUES (13, 'permissions:view', 'Jogosultságok megtekintése', 4, '2025-04-20 22:38:50.193265+00');
INSERT INTO auth.permissions VALUES (14, 'permissions:assign', 'Jogosultságok hozzárendelése', 4, '2025-04-20 22:38:50.193265+00');
INSERT INTO auth.permissions VALUES (15, 'content:view', 'Tartalmak megtekintése', 5, '2025-04-20 22:38:50.193265+00');
INSERT INTO auth.permissions VALUES (16, 'content:create', 'Tartalmak létrehozása', 5, '2025-04-20 22:38:50.193265+00');
INSERT INTO auth.permissions VALUES (17, 'content:update', 'Tartalmak módosítása', 5, '2025-04-20 22:38:50.193265+00');
INSERT INTO auth.permissions VALUES (18, 'content:delete', 'Tartalmak törlése', 5, '2025-04-20 22:38:50.193265+00');
INSERT INTO auth.permissions VALUES (19, 'content:publish', 'Tartalmak publikálása', 5, '2025-04-20 22:38:50.193265+00');
INSERT INTO auth.permissions VALUES (20, 'settings:view', 'Beállítások megtekintése', 6, '2025-04-20 22:38:50.193265+00');
INSERT INTO auth.permissions VALUES (21, 'settings:update', 'Beállítások módosítása', 6, '2025-04-20 22:38:50.193265+00');


--
-- TOC entry 3521 (class 0 OID 16425)
-- Dependencies: 228
-- Data for Name: providers; Type: TABLE DATA; Schema: auth; Owner: -
--

INSERT INTO auth.providers VALUES (1, 'credential', true, '{"allowRegistration": true, "passwordMinLength": 8, "requireEmailVerification": true}', '2025-04-20 22:38:50.18853+00', '2025-04-20 22:38:50.18853+00');
INSERT INTO auth.providers VALUES (2, 'google', true, '{"clientId": "YOUR_GOOGLE_CLIENT_ID", "callbackUrl": "http://localhost:3000/api/auth/callback/google", "clientSecret": "YOUR_GOOGLE_CLIENT_SECRET"}', '2025-04-20 22:38:50.18853+00', '2025-04-20 22:38:50.18853+00');
INSERT INTO auth.providers VALUES (3, 'facebook', false, '{"clientId": "", "callbackUrl": "http://localhost:3000/api/auth/callback/facebook", "clientSecret": ""}', '2025-04-20 22:38:50.18853+00', '2025-04-20 22:38:50.18853+00');
INSERT INTO auth.providers VALUES (4, 'github', false, '{"clientId": "", "callbackUrl": "http://localhost:3000/api/auth/callback/github", "clientSecret": ""}', '2025-04-20 22:38:50.18853+00', '2025-04-20 22:38:50.18853+00');


--
-- TOC entry 3523 (class 0 OID 16434)
-- Dependencies: 230
-- Data for Name: resources; Type: TABLE DATA; Schema: auth; Owner: -
--

INSERT INTO auth.resources VALUES (1, 'users', 'Felhasználók adatainak kezelése', '2025-04-20 22:38:50.186618+00');
INSERT INTO auth.resources VALUES (2, 'groups', 'Felhasználói csoportok kezelése', '2025-04-20 22:38:50.186618+00');
INSERT INTO auth.resources VALUES (3, 'roles', 'Szerepkörök kezelése', '2025-04-20 22:38:50.186618+00');
INSERT INTO auth.resources VALUES (4, 'permissions', 'Jogosultságok kezelése', '2025-04-20 22:38:50.186618+00');
INSERT INTO auth.resources VALUES (5, 'content', 'Tartalmak kezelése', '2025-04-20 22:38:50.186618+00');
INSERT INTO auth.resources VALUES (6, 'settings', 'Rendszerbeállítások kezelése', '2025-04-20 22:38:50.186618+00');


--
-- TOC entry 3525 (class 0 OID 16441)
-- Dependencies: 232
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: auth; Owner: -
--

INSERT INTO auth.role_permissions VALUES (1, 1, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (1, 2, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (1, 3, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (1, 4, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (1, 5, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (1, 6, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (1, 7, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (1, 8, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (1, 9, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (1, 10, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (1, 11, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (1, 12, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (1, 13, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (1, 14, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (1, 15, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (1, 16, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (1, 17, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (1, 18, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (1, 19, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (1, 20, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (1, 21, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (2, 1, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (2, 2, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (2, 3, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (2, 5, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (2, 7, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (2, 9, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (2, 15, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (2, 16, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (2, 17, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (2, 18, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (2, 19, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (2, 20, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (3, 15, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (3, 16, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (3, 17, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (3, 19, '2025-04-20 22:38:50.195169+00');
INSERT INTO auth.role_permissions VALUES (4, 15, '2025-04-20 22:38:50.195169+00');


--
-- TOC entry 3527 (class 0 OID 16446)
-- Dependencies: 234
-- Data for Name: roles; Type: TABLE DATA; Schema: auth; Owner: -
--

INSERT INTO auth.roles VALUES (1, 'Rendszergazda', 'Korlátlan jogosultsággal rendelkező szerep', '2025-04-20 22:38:50.191457+00', '2025-04-20 22:38:50.191457+00');
INSERT INTO auth.roles VALUES (2, 'Adminisztrátor', 'Adminisztrációs feladatok elvégzésére jogosult szerep', '2025-04-20 22:38:50.191457+00', '2025-04-20 22:38:50.191457+00');
INSERT INTO auth.roles VALUES (3, 'Szerkesztő', 'Tartalmak kezelésére jogosult szerep', '2025-04-20 22:38:50.191457+00', '2025-04-20 22:38:50.191457+00');
INSERT INTO auth.roles VALUES (4, 'Felhasználó', 'Alapszintű felhasználói szerep', '2025-04-20 22:38:50.191457+00', '2025-04-20 22:38:50.191457+00');


--
-- TOC entry 3529 (class 0 OID 16454)
-- Dependencies: 236
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- TOC entry 3531 (class 0 OID 16462)
-- Dependencies: 238
-- Data for Name: user_groups; Type: TABLE DATA; Schema: auth; Owner: -
--

INSERT INTO auth.user_groups VALUES (1, 1, '2025-04-20 22:38:50.198944+00');
INSERT INTO auth.user_groups VALUES (2, 2, '2025-04-20 22:38:50.226013+00');
INSERT INTO auth.user_groups VALUES (3, 3, '2025-04-20 22:38:50.248243+00');


--
-- TOC entry 3532 (class 0 OID 16466)
-- Dependencies: 239
-- Data for Name: user_roles; Type: TABLE DATA; Schema: auth; Owner: -
--

INSERT INTO auth.user_roles VALUES (1, 1, '2025-04-20 22:38:50.271174+00');
INSERT INTO auth.user_roles VALUES (2, 2, '2025-04-20 22:38:50.271174+00');
INSERT INTO auth.user_roles VALUES (3, 3, '2025-04-20 22:38:50.271174+00');
INSERT INTO auth.user_roles VALUES (1, 4, '2025-04-20 22:38:50.271174+00');
INSERT INTO auth.user_roles VALUES (2, 4, '2025-04-20 22:38:50.271174+00');
INSERT INTO auth.user_roles VALUES (3, 4, '2025-04-20 22:38:50.271174+00');


--
-- TOC entry 3533 (class 0 OID 16470)
-- Dependencies: 240
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

INSERT INTO auth.users VALUES (1, 'Rendszergazda', 'sysadmin@example.com', true, NULL, NULL, '2025-04-20 22:38:50.198944+00', '2025-04-20 22:38:50.198944+00', NULL);
INSERT INTO auth.users VALUES (2, 'Admin', 'admin@example.com', true, NULL, NULL, '2025-04-20 22:38:50.226013+00', '2025-04-20 22:38:50.226013+00', NULL);
INSERT INTO auth.users VALUES (3, 'Tartalomszerkesztő', 'content_editor@example.com', true, NULL, NULL, '2025-04-20 22:38:50.248243+00', '2025-04-20 22:38:50.248243+00', NULL);


--
-- TOC entry 3535 (class 0 OID 16479)
-- Dependencies: 242
-- Data for Name: verifications; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- TOC entry 3554 (class 0 OID 0)
-- Dependencies: 219
-- Name: accounts_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.accounts_id_seq', 3, true);


--
-- TOC entry 3555 (class 0 OID 0)
-- Dependencies: 221
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.audit_logs_id_seq', 1, false);


--
-- TOC entry 3556 (class 0 OID 0)
-- Dependencies: 223
-- Name: group_permissions_group_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.group_permissions_group_id_seq', 1, false);


--
-- TOC entry 3557 (class 0 OID 0)
-- Dependencies: 225
-- Name: groups_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.groups_id_seq', 1, false);


--
-- TOC entry 3558 (class 0 OID 0)
-- Dependencies: 227
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.permissions_id_seq', 1, false);


--
-- TOC entry 3559 (class 0 OID 0)
-- Dependencies: 229
-- Name: providers_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.providers_id_seq', 4, true);


--
-- TOC entry 3560 (class 0 OID 0)
-- Dependencies: 231
-- Name: resources_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.resources_id_seq', 1, false);


--
-- TOC entry 3561 (class 0 OID 0)
-- Dependencies: 233
-- Name: role_permissions_role_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.role_permissions_role_id_seq', 1, false);


--
-- TOC entry 3562 (class 0 OID 0)
-- Dependencies: 235
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.roles_id_seq', 1, false);


--
-- TOC entry 3563 (class 0 OID 0)
-- Dependencies: 237
-- Name: sessions_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.sessions_id_seq', 1, false);


--
-- TOC entry 3564 (class 0 OID 0)
-- Dependencies: 241
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.users_id_seq', 3, true);


--
-- TOC entry 3565 (class 0 OID 0)
-- Dependencies: 243
-- Name: verifications_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.verifications_id_seq', 1, false);


--
-- TOC entry 3313 (class 2606 OID 16500)
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- TOC entry 3315 (class 2606 OID 16502)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3317 (class 2606 OID 16504)
-- Name: group_permissions group_permissions_group_id_permission_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.group_permissions
    ADD CONSTRAINT group_permissions_group_id_permission_id_pk PRIMARY KEY (group_id, permission_id);


--
-- TOC entry 3319 (class 2606 OID 16506)
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- TOC entry 3321 (class 2606 OID 16508)
-- Name: permissions permissions_name_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.permissions
    ADD CONSTRAINT permissions_name_unique UNIQUE (name);


--
-- TOC entry 3323 (class 2606 OID 16510)
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 3325 (class 2606 OID 16512)
-- Name: providers providers_name_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.providers
    ADD CONSTRAINT providers_name_unique UNIQUE (name);


--
-- TOC entry 3327 (class 2606 OID 16514)
-- Name: providers providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.providers
    ADD CONSTRAINT providers_pkey PRIMARY KEY (id);


--
-- TOC entry 3329 (class 2606 OID 16516)
-- Name: resources resources_name_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.resources
    ADD CONSTRAINT resources_name_unique UNIQUE (name);


--
-- TOC entry 3331 (class 2606 OID 16518)
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- TOC entry 3333 (class 2606 OID 16520)
-- Name: role_permissions role_permissions_role_id_permission_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.role_permissions
    ADD CONSTRAINT role_permissions_role_id_permission_id_pk PRIMARY KEY (role_id, permission_id);


--
-- TOC entry 3335 (class 2606 OID 16522)
-- Name: roles roles_name_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.roles
    ADD CONSTRAINT roles_name_unique UNIQUE (name);


--
-- TOC entry 3337 (class 2606 OID 16524)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 3339 (class 2606 OID 16526)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 3341 (class 2606 OID 16528)
-- Name: sessions sessions_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_token_unique UNIQUE (token);


--
-- TOC entry 3343 (class 2606 OID 16530)
-- Name: user_groups user_groups_user_id_group_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.user_groups
    ADD CONSTRAINT user_groups_user_id_group_id_pk PRIMARY KEY (user_id, group_id);


--
-- TOC entry 3345 (class 2606 OID 16532)
-- Name: user_roles user_roles_user_id_role_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.user_roles
    ADD CONSTRAINT user_roles_user_id_role_id_pk PRIMARY KEY (user_id, role_id);


--
-- TOC entry 3347 (class 2606 OID 16534)
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- TOC entry 3349 (class 2606 OID 16536)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3351 (class 2606 OID 16538)
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- TOC entry 3353 (class 2606 OID 16540)
-- Name: verifications verifications_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.verifications
    ADD CONSTRAINT verifications_pkey PRIMARY KEY (id);


--
-- TOC entry 3354 (class 2606 OID 16541)
-- Name: accounts accounts_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.accounts
    ADD CONSTRAINT accounts_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- TOC entry 3355 (class 2606 OID 16546)
-- Name: audit_logs audit_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_logs
    ADD CONSTRAINT audit_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- TOC entry 3356 (class 2606 OID 16551)
-- Name: group_permissions group_permissions_group_id_groups_id_fk; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.group_permissions
    ADD CONSTRAINT group_permissions_group_id_groups_id_fk FOREIGN KEY (group_id) REFERENCES auth.groups(id);


--
-- TOC entry 3357 (class 2606 OID 16556)
-- Name: group_permissions group_permissions_permission_id_permissions_id_fk; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.group_permissions
    ADD CONSTRAINT group_permissions_permission_id_permissions_id_fk FOREIGN KEY (permission_id) REFERENCES auth.permissions(id);


--
-- TOC entry 3358 (class 2606 OID 16561)
-- Name: permissions permissions_resource_id_resources_id_fk; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.permissions
    ADD CONSTRAINT permissions_resource_id_resources_id_fk FOREIGN KEY (resource_id) REFERENCES auth.resources(id);


--
-- TOC entry 3359 (class 2606 OID 16566)
-- Name: role_permissions role_permissions_permission_id_permissions_id_fk; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_permissions_id_fk FOREIGN KEY (permission_id) REFERENCES auth.permissions(id);


--
-- TOC entry 3360 (class 2606 OID 16571)
-- Name: role_permissions role_permissions_role_id_roles_id_fk; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.role_permissions
    ADD CONSTRAINT role_permissions_role_id_roles_id_fk FOREIGN KEY (role_id) REFERENCES auth.roles(id);


--
-- TOC entry 3361 (class 2606 OID 16576)
-- Name: sessions sessions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- TOC entry 3362 (class 2606 OID 16581)
-- Name: user_groups user_groups_group_id_groups_id_fk; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.user_groups
    ADD CONSTRAINT user_groups_group_id_groups_id_fk FOREIGN KEY (group_id) REFERENCES auth.groups(id);


--
-- TOC entry 3363 (class 2606 OID 16586)
-- Name: user_groups user_groups_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.user_groups
    ADD CONSTRAINT user_groups_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- TOC entry 3364 (class 2606 OID 16591)
-- Name: user_roles user_roles_role_id_roles_id_fk; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.user_roles
    ADD CONSTRAINT user_roles_role_id_roles_id_fk FOREIGN KEY (role_id) REFERENCES auth.roles(id);


--
-- TOC entry 3365 (class 2606 OID 16596)
-- Name: user_roles user_roles_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.user_roles
    ADD CONSTRAINT user_roles_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES auth.users(id);


-- Completed on 2025-04-22 21:57:43 CEST

--
-- PostgreSQL database dump complete
--

