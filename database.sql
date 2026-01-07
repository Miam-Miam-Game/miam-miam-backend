--
-- PostgreSQL database dump
--

\restrict fkRS0ta4T59LvRa80tHsL6HTSPvTvZBzs1J71Gg68XluRsEZcTx5fG2NTqRD2NQ

-- Dumped from database version 14.17 (Homebrew)
-- Dumped by pg_dump version 14.20 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: player; Type: TABLE; Schema: public; Owner: myuser
--

CREATE TABLE public.player (
    "idPlayer" integer NOT NULL,
    username character varying NOT NULL,
    score integer NOT NULL
);


ALTER TABLE public.player OWNER TO myuser;

--
-- Name: player_idPlayer_seq; Type: SEQUENCE; Schema: public; Owner: myuser
--

CREATE SEQUENCE public."player_idPlayer_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."player_idPlayer_seq" OWNER TO myuser;

--
-- Name: player_idPlayer_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: myuser
--

ALTER SEQUENCE public."player_idPlayer_seq" OWNED BY public.player."idPlayer";


--
-- Name: record; Type: TABLE; Schema: public; Owner: myuser
--

CREATE TABLE public.record (
    "idRecord" integer NOT NULL,
    username character varying NOT NULL,
    score integer NOT NULL
);


ALTER TABLE public.record OWNER TO myuser;

--
-- Name: record_idRecord_seq; Type: SEQUENCE; Schema: public; Owner: myuser
--

CREATE SEQUENCE public."record_idRecord_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."record_idRecord_seq" OWNER TO myuser;

--
-- Name: record_idRecord_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: myuser
--

ALTER SEQUENCE public."record_idRecord_seq" OWNED BY public.record."idRecord";


--
-- Name: player idPlayer; Type: DEFAULT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.player ALTER COLUMN "idPlayer" SET DEFAULT nextval('public."player_idPlayer_seq"'::regclass);


--
-- Name: record idRecord; Type: DEFAULT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.record ALTER COLUMN "idRecord" SET DEFAULT nextval('public."record_idRecord_seq"'::regclass);


--
-- Data for Name: player; Type: TABLE DATA; Schema: public; Owner: myuser
--

COPY public.player ("idPlayer", username, score) FROM stdin;
1	nicki48	0
\.


--
-- Data for Name: record; Type: TABLE DATA; Schema: public; Owner: myuser
--

COPY public.record ("idRecord", username, score) FROM stdin;
\.


--
-- Name: player_idPlayer_seq; Type: SEQUENCE SET; Schema: public; Owner: myuser
--

SELECT pg_catalog.setval('public."player_idPlayer_seq"', 1, true);


--
-- Name: record_idRecord_seq; Type: SEQUENCE SET; Schema: public; Owner: myuser
--

SELECT pg_catalog.setval('public."record_idRecord_seq"', 1, false);


--
-- Name: player PK_66e13448dff61f4c1e93f1e0df0; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.player
    ADD CONSTRAINT "PK_66e13448dff61f4c1e93f1e0df0" PRIMARY KEY ("idPlayer");


--
-- Name: record PK_85117e5ff885dc01ea5123b61fd; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.record
    ADD CONSTRAINT "PK_85117e5ff885dc01ea5123b61fd" PRIMARY KEY ("idRecord");


--
-- PostgreSQL database dump complete
--

\unrestrict fkRS0ta4T59LvRa80tHsL6HTSPvTvZBzs1J71Gg68XluRsEZcTx5fG2NTqRD2NQ