export interface LFMTopArtists {
    topartists: Topartists;
}
export interface Topartists {
    artist: Artist[];
    "@attr": TopartistsAttr;
}
export interface TopartistsAttr {
    user: string;
    totalPages: string;
    page: string;
    perPage: string;
    total: string;
}
export interface Artist {
    streamable: string;
    image: Image[];
    mbid: string;
    url: string;
    playcount: string;
    "@attr": ArtistAttr;
    name: string;
}
export interface ArtistAttr {
    rank: string;
}
export interface Image {
    size: Size;
    "#text": string;
}
export declare enum Size {
    Extralarge = "extralarge",
    Large = "large",
    Medium = "medium",
    Mega = "mega",
    Small = "small"
}