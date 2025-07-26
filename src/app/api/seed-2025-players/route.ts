import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to convert market value to FPL price
function convertMarketValueToFPLPrice(marketValue: string): number {
  // Remove € symbol
  const cleanValue = marketValue.replace('€', '');
  
  // Handle 'k' (thousands) values
  if (cleanValue.includes('k')) {
    const valueInK = parseFloat(cleanValue.replace('k', ''));
    const valueInM = valueInK / 1000; // Convert thousands to millions
    return convertValueToFPLPrice(valueInM);
  }
  
  // Handle 'm' (millions) values
  if (cleanValue.includes('m')) {
    const valueInM = parseFloat(cleanValue.replace('m', ''));
    return convertValueToFPLPrice(valueInM);
  }
  
  // Default fallback
  return 4.0;
}

// Helper function to convert millions value to FPL price
function convertValueToFPLPrice(valueInM: number): number {
  // Convert to FPL-style pricing based on actual FPL 2025/26 prices
  if (valueInM >= 150) return 14.5; // €150m+ = £14.5m (Salah level)
  if (valueInM >= 120) return 14.0; // €120m+ = £14.0m (Haaland level)
  if (valueInM >= 100) return 12.0; // €100m+ = £12.0m
  if (valueInM >= 80) return 10.5;  // €80m+ = £10.5m (Isak level)
  if (valueInM >= 60) return 9.0;   // €60m+ = £9.0m
  if (valueInM >= 50) return 8.5;   // €50m+ = £8.5m (Wirtz level)
  if (valueInM >= 40) return 7.5;   // €40m+ = £7.5m
  if (valueInM >= 30) return 6.5;   // €30m+ = £6.5m
  if (valueInM >= 25) return 6.0;   // €25m+ = £6.0m (Ait-Nouri level)
  if (valueInM >= 20) return 5.5;   // €20m+ = £5.5m (Pickford level)
  if (valueInM >= 15) return 5.0;   // €15m+ = £5.0m
  if (valueInM >= 10) return 4.5;   // €10m+ = £4.5m
  if (valueInM >= 5) return 4.0;    // €5m+ = £4.0m
  return 4.0; // Minimum price £4.0m
}

// Helper function to map positions
function mapPosition(position: string): string {
  // Handle specific FPL 2025/26 position changes
  if (position.includes('Goalkeeper')) return 'GK';
  
  // Defenders
  if (position.includes('Back') || position.includes('Defender') || position.includes('Centre-Back')) return 'DEF';
  
  // Midfielders (including some reclassified players)
  if (position.includes('Midfield') || position.includes('Winger') || position.includes('Attacking Midfield')) return 'MID';
  
  // Forwards
  if (position.includes('Forward') || position.includes('Striker') || position.includes('Second Striker')) return 'FWD';
  
  return 'MID'; // Default
}

// 2025 Premier League Teams Data
const teamsData = [
  {
    name: "Manchester City",
    players: [
      { name: "Ederson", position: "Goalkeeper", marketValue: "€20.00m", nationality: "Brazil" },
      { name: "Stefan Ortega", position: "Goalkeeper", marketValue: "€8.00m", nationality: "Germany" },
      { name: "Marcus Bettinelli", position: "Goalkeeper", marketValue: "€600k", nationality: "England" },
      { name: "Rúben Dias", position: "Centre-Back", marketValue: "€65.00m", nationality: "Portugal" },
      { name: "Abdukodir Khusanov", position: "Centre-Back", marketValue: "€35.00m", nationality: "Uzbekistan" },
      { name: "Vitor Reis", position: "Centre-Back", marketValue: "€30.00m", nationality: "Brazil" },
      { name: "Manuel Akanji", position: "Centre-Back", marketValue: "€28.00m", nationality: "Switzerland" },
      { name: "John Stones", position: "Centre-Back", marketValue: "€25.00m", nationality: "England" },
      { name: "Nathan Aké", position: "Centre-Back", marketValue: "€25.00m", nationality: "Netherlands" },
      { name: "Josko Gvardiol", position: "Left-Back", marketValue: "€75.00m", nationality: "Croatia" },
      { name: "Rayan Aït-Nouri", position: "Left-Back", marketValue: "€35.00m", nationality: "Algeria" },
      { name: "Josh Wilson-Esbrand", position: "Left-Back", marketValue: "€4.00m", nationality: "England" },
      { name: "Rico Lewis", position: "Right-Back", marketValue: "€40.00m", nationality: "England" },
      { name: "Issa Kaboré", position: "Right-Back", marketValue: "€4.00m", nationality: "Burkina Faso" },
      { name: "Rodri", position: "Defensive Midfield", marketValue: "€110.00m", nationality: "Spain" },
      { name: "Kalvin Phillips", position: "Defensive Midfield", marketValue: "€12.00m", nationality: "England" },
      { name: "Tijjani Reijnders", position: "Central Midfield", marketValue: "€60.00m", nationality: "Netherlands" },
      { name: "Nico González", position: "Central Midfield", marketValue: "€40.00m", nationality: "Spain" },
      { name: "Matheus Nunes", position: "Central Midfield", marketValue: "€35.00m", nationality: "Portugal" },
      { name: "Mateo Kovacic", position: "Central Midfield", marketValue: "€20.00m", nationality: "Croatia" },
      { name: "Sverre Nypan", position: "Central Midfield", marketValue: "€15.00m", nationality: "Norway" },
      { name: "İlkay Gündoğan", position: "Central Midfield", marketValue: "€5.00m", nationality: "Germany" },
      { name: "Bernardo Silva", position: "Attacking Midfield", marketValue: "€38.00m", nationality: "Portugal" },
      { name: "James McAtee", position: "Attacking Midfield", marketValue: "€20.00m", nationality: "England" },
      { name: "Claudio Echeverri", position: "Attacking Midfield", marketValue: "€18.00m", nationality: "Argentina" },
      { name: "Nico O'Reilly", position: "Attacking Midfield", marketValue: "€18.00m", nationality: "England" },
      { name: "Jérémy Doku", position: "Left Winger", marketValue: "€50.00m", nationality: "Belgium" },
      { name: "Jack Grealish", position: "Left Winger", marketValue: "€28.00m", nationality: "England" },
      { name: "Phil Foden", position: "Right Winger", marketValue: "€100.00m", nationality: "England" },
      { name: "Savinho", position: "Right Winger", marketValue: "€50.00m", nationality: "Brazil" },
      { name: "Rayan Cherki", position: "Right Winger", marketValue: "€45.00m", nationality: "France" },
      { name: "Oscar Bobb", position: "Right Winger", marketValue: "€25.00m", nationality: "Norway" },
      { name: "Erling Haaland", position: "Centre-Forward", marketValue: "€180.00m", nationality: "Norway" },
      { name: "Omar Marmoush", position: "Centre-Forward", marketValue: "€75.00m", nationality: "Egypt" }
    ]
  },
  {
    name: "Chelsea",
    players: [
      { name: "Robert Sánchez", position: "Goalkeeper", marketValue: "€20.00m", nationality: "Spain" },
      { name: "Filip Jørgensen", position: "Goalkeeper", marketValue: "€18.00m", nationality: "Denmark" },
      { name: "Mike Penders", position: "Goalkeeper", marketValue: "€12.00m", nationality: "Belgium" },
      { name: "Gabriel Slonina", position: "Goalkeeper", marketValue: "€3.50m", nationality: "United States" },
      { name: "Levi Colwill", position: "Centre-Back", marketValue: "€55.00m", nationality: "England" },
      { name: "Trevoh Chalobah", position: "Centre-Back", marketValue: "€25.00m", nationality: "England" },
      { name: "Wesley Fofana", position: "Centre-Back", marketValue: "€25.00m", nationality: "France" },
      { name: "Renato Veiga", position: "Centre-Back", marketValue: "€25.00m", nationality: "Portugal" },
      { name: "Axel Disasi", position: "Centre-Back", marketValue: "€22.00m", nationality: "France" },
      { name: "Benoît Badiashile", position: "Centre-Back", marketValue: "€22.00m", nationality: "France" },
      { name: "Tosin Adarabioyo", position: "Centre-Back", marketValue: "€20.00m", nationality: "England" },
      { name: "Mamadou Sarr", position: "Centre-Back", marketValue: "€20.00m", nationality: "France" },
      { name: "Aarón Anselmino", position: "Centre-Back", marketValue: "€8.00m", nationality: "Argentina" },
      { name: "Marc Cucurella", position: "Left-Back", marketValue: "€35.00m", nationality: "Spain" },
      { name: "Ben Chilwell", position: "Left-Back", marketValue: "€15.00m", nationality: "England" },
      { name: "Malo Gusto", position: "Right-Back", marketValue: "€35.00m", nationality: "France" },
      { name: "Reece James", position: "Right-Back", marketValue: "€30.00m", nationality: "England" },
      { name: "Alfie Gilchrist", position: "Right-Back", marketValue: "€8.00m", nationality: "England" },
      { name: "Josh Acheampong", position: "Right-Back", marketValue: "€8.00m", nationality: "England" },
      { name: "Moisés Caicedo", position: "Defensive Midfield", marketValue: "€90.00m", nationality: "Ecuador" },
      { name: "Roméo Lavia", position: "Defensive Midfield", marketValue: "€40.00m", nationality: "Belgium" },
      { name: "Dário Essugo", position: "Defensive Midfield", marketValue: "€20.00m", nationality: "Portugal" },
      { name: "Lesley Ugochukwu", position: "Defensive Midfield", marketValue: "€18.00m", nationality: "France" },
      { name: "Enzo Fernández", position: "Central Midfield", marketValue: "€75.00m", nationality: "Argentina" },
      { name: "Andrey Santos", position: "Central Midfield", marketValue: "€35.00m", nationality: "Brazil" },
      { name: "Kiernan Dewsbury-Hall", position: "Central Midfield", marketValue: "€20.00m", nationality: "England" },
      { name: "Carney Chukwuemeka", position: "Central Midfield", marketValue: "€18.00m", nationality: "England" },
      { name: "Cole Palmer", position: "Attacking Midfield", marketValue: "€120.00m", nationality: "England" },
      { name: "Kendry Páez", position: "Attacking Midfield", marketValue: "€10.00m", nationality: "Ecuador" },
      { name: "Jamie Gittens", position: "Left Winger", marketValue: "€50.00m", nationality: "England" },
      { name: "Tyrique George", position: "Left Winger", marketValue: "€10.00m", nationality: "England" },
      { name: "Mykhaylo Mudryk", position: "Left Winger", marketValue: "€25.00m", nationality: "Ukraine" },
      { name: "Estêvão", position: "Right Winger", marketValue: "€60.00m", nationality: "Brazil" },
      { name: "Pedro Neto", position: "Right Winger", marketValue: "€50.00m", nationality: "Portugal" },
      { name: "Raheem Sterling", position: "Right Winger", marketValue: "€10.00m", nationality: "England" },
      { name: "João Félix", position: "Second Striker", marketValue: "€20.00m", nationality: "Portugal" },
      { name: "Nicolas Jackson", position: "Centre-Forward", marketValue: "€50.00m", nationality: "Senegal" },
      { name: "João Pedro", position: "Centre-Forward", marketValue: "€50.00m", nationality: "Brazil" },
      { name: "Liam Delap", position: "Centre-Forward", marketValue: "€40.00m", nationality: "England" },
      { name: "Christopher Nkunku", position: "Centre-Forward", marketValue: "€35.00m", nationality: "France" },
      { name: "Armando Broja", position: "Centre-Forward", marketValue: "€12.00m", nationality: "Albania" },
      { name: "Marc Guiu", position: "Centre-Forward", marketValue: "€8.00m", nationality: "Spain" },
      { name: "David Datro Fofana", position: "Centre-Forward", marketValue: "€6.00m", nationality: "Cote d'Ivoire" }
    ]
  },
  {
    name: "Arsenal",
    players: [
      { name: "David Raya", position: "Goalkeeper", marketValue: "€40.00m", nationality: "Spain" },
      { name: "Kepa Arrizabalaga", position: "Goalkeeper", marketValue: "€10.00m", nationality: "Spain" },
      { name: "Karl Hein", position: "Goalkeeper", marketValue: "€3.00m", nationality: "Estonia" },
      { name: "William Saliba", position: "Centre-Back", marketValue: "€80.00m", nationality: "France" },
      { name: "Gabriel Magalhães", position: "Centre-Back", marketValue: "€75.00m", nationality: "Brazil" },
      { name: "Cristhian Mosquera", position: "Centre-Back", marketValue: "€30.00m", nationality: "Spain" },
      { name: "Jakub Kiwior", position: "Centre-Back", marketValue: "€28.00m", nationality: "Poland" },
      { name: "Myles Lewis-Skelly", position: "Left-Back", marketValue: "€45.00m", nationality: "England" },
      { name: "Riccardo Calafiori", position: "Left-Back", marketValue: "€35.00m", nationality: "Italy" },
      { name: "Oleksandr Zinchenko", position: "Left-Back", marketValue: "€20.00m", nationality: "Ukraine" },
      { name: "Jurrien Timber", position: "Right-Back", marketValue: "€55.00m", nationality: "Netherlands" },
      { name: "Ben White", position: "Right-Back", marketValue: "€45.00m", nationality: "England" },
      { name: "Martín Zubimendi", position: "Defensive Midfield", marketValue: "€60.00m", nationality: "Spain" },
      { name: "Christian Nørgaard", position: "Defensive Midfield", marketValue: "€11.00m", nationality: "Denmark" },
      { name: "Declan Rice", position: "Central Midfield", marketValue: "€120.00m", nationality: "England" },
      { name: "Mikel Merino", position: "Central Midfield", marketValue: "€35.00m", nationality: "Spain" },
      { name: "Albert Sambi Lokonga", position: "Central Midfield", marketValue: "€8.00m", nationality: "Belgium" },
      { name: "Martin Ødegaard", position: "Attacking Midfield", marketValue: "€85.00m", nationality: "Norway" },
      { name: "Fábio Vieira", position: "Attacking Midfield", marketValue: "€22.00m", nationality: "Portugal" },
      { name: "Gabriel Martinelli", position: "Left Winger", marketValue: "€55.00m", nationality: "Brazil" },
      { name: "Leandro Trossard", position: "Left Winger", marketValue: "€22.00m", nationality: "Belgium" },
      { name: "Bukayo Saka", position: "Right Winger", marketValue: "€150.00m", nationality: "England" },
      { name: "Ethan Nwaneri", position: "Right Winger", marketValue: "€55.00m", nationality: "England" },
      { name: "Noni Madueke", position: "Right Winger", marketValue: "€40.00m", nationality: "England" },
      { name: "Reiss Nelson", position: "Right Winger", marketValue: "€16.00m", nationality: "England" },
      { name: "Kai Havertz", position: "Centre-Forward", marketValue: "€65.00m", nationality: "Germany" },
      { name: "Gabriel Jesus", position: "Centre-Forward", marketValue: "€32.00m", nationality: "Brazil" }
    ]
  },
  {
    name: "Liverpool",
    players: [
      { name: "Giorgi Mamardashvili", position: "Goalkeeper", marketValue: "€30.00m", nationality: "Georgia" },
      { name: "Alisson", position: "Goalkeeper", marketValue: "€20.00m", nationality: "Brazil" },
      { name: "Freddie Woodman", position: "Goalkeeper", marketValue: "€3.50m", nationality: "England" },
      { name: "Ármin Pécsi", position: "Goalkeeper", marketValue: "€800k", nationality: "Hungary" },
      { name: "Ibrahima Konaté", position: "Centre-Back", marketValue: "€60.00m", nationality: "France" },
      { name: "Virgil van Dijk", position: "Centre-Back", marketValue: "€23.00m", nationality: "Netherlands" },
      { name: "Joe Gomez", position: "Centre-Back", marketValue: "€20.00m", nationality: "England" },
      { name: "Rhys Williams", position: "Centre-Back", marketValue: "€700k", nationality: "England" },
      { name: "Milos Kerkez", position: "Left-Back", marketValue: "€45.00m", nationality: "Hungary" },
      { name: "Konstantinos Tsimikas", position: "Left-Back", marketValue: "€18.00m", nationality: "Greece" },
      { name: "Andrew Robertson", position: "Left-Back", marketValue: "€18.00m", nationality: "Scotland" },
      { name: "Jeremie Frimpong", position: "Right-Back", marketValue: "€50.00m", nationality: "Netherlands" },
      { name: "Conor Bradley", position: "Right-Back", marketValue: "€30.00m", nationality: "Northern Ireland" },
      { name: "Calvin Ramsay", position: "Right-Back", marketValue: "€2.50m", nationality: "Scotland" },
      { name: "Ryan Gravenberch", position: "Defensive Midfield", marketValue: "€75.00m", nationality: "Netherlands" },
      { name: "Stefan Bajcetic", position: "Defensive Midfield", marketValue: "€9.00m", nationality: "Spain" },
      { name: "Wataru Endo", position: "Defensive Midfield", marketValue: "€8.00m", nationality: "Japan" },
      { name: "Tyler Morton", position: "Defensive Midfield", marketValue: "€7.00m", nationality: "England" },
      { name: "Alexis Mac Allister", position: "Central Midfield", marketValue: "€100.00m", nationality: "Argentina" },
      { name: "Curtis Jones", position: "Central Midfield", marketValue: "€45.00m", nationality: "England" },
      { name: "Florian Wirtz", position: "Attacking Midfield", marketValue: "€140.00m", nationality: "Germany" },
      { name: "Dominik Szoboszlai", position: "Attacking Midfield", marketValue: "€80.00m", nationality: "Hungary" },
      { name: "Harvey Elliott", position: "Attacking Midfield", marketValue: "€30.00m", nationality: "England" },
      { name: "Luis Díaz", position: "Left Winger", marketValue: "€70.00m", nationality: "Colombia" },
      { name: "Cody Gakpo", position: "Left Winger", marketValue: "€70.00m", nationality: "Netherlands" },
      { name: "Mohamed Salah", position: "Right Winger", marketValue: "€50.00m", nationality: "Egypt" },
      { name: "Federico Chiesa", position: "Right Winger", marketValue: "€14.00m", nationality: "Italy" },
      { name: "Ben Doak", position: "Right Winger", marketValue: "€14.00m", nationality: "Scotland" },
      { name: "Hugo Ekitiké", position: "Centre-Forward", marketValue: "€75.00m", nationality: "France" },
      { name: "Darwin Núñez", position: "Centre-Forward", marketValue: "€45.00m", nationality: "Uruguay" }
    ]
  },
  {
    name: "Tottenham Hotspur",
    players: [
      { name: "Guglielmo Vicario", position: "Goalkeeper", marketValue: "€32.00m", nationality: "Italy" },
      { name: "Antonín Kinský", position: "Goalkeeper", marketValue: "€15.00m", nationality: "Czech Republic" },
      { name: "Brandon Austin", position: "Goalkeeper", marketValue: "€600k", nationality: "England" },
      { name: "Cristian Romero", position: "Centre-Back", marketValue: "€50.00m", nationality: "Argentina" },
      { name: "Micky van de Ven", position: "Centre-Back", marketValue: "€50.00m", nationality: "Netherlands" },
      { name: "Kevin Danso", position: "Centre-Back", marketValue: "€25.00m", nationality: "Austria" },
      { name: "Radu Drăgușin", position: "Centre-Back", marketValue: "€25.00m", nationality: "Romania" },
      { name: "Luka Vuskovic", position: "Centre-Back", marketValue: "€12.00m", nationality: "Croatia" },
      { name: "Ben Davies", position: "Centre-Back", marketValue: "€6.00m", nationality: "Wales" },
      { name: "Kota Takai", position: "Centre-Back", marketValue: "€2.50m", nationality: "Japan" },
      { name: "Destiny Udogie", position: "Left-Back", marketValue: "€40.00m", nationality: "Italy" },
      { name: "Djed Spence", position: "Left-Back", marketValue: "€20.00m", nationality: "England" },
      { name: "Pedro Porro", position: "Right-Back", marketValue: "€38.00m", nationality: "Spain" },
      { name: "Archie Gray", position: "Defensive Midfield", marketValue: "€38.00m", nationality: "England" },
      { name: "Rodrigo Bentancur", position: "Defensive Midfield", marketValue: "€30.00m", nationality: "Uruguay" },
      { name: "Yves Bissouma", position: "Defensive Midfield", marketValue: "€25.00m", nationality: "Mali" },
      { name: "Lucas Bergvall", position: "Central Midfield", marketValue: "€38.00m", nationality: "Sweden" },
      { name: "Pape Matar Sarr", position: "Central Midfield", marketValue: "€32.00m", nationality: "Senegal" },
      { name: "Dejan Kulusevski", position: "Attacking Midfield", marketValue: "€50.00m", nationality: "Sweden" },
      { name: "James Maddison", position: "Attacking Midfield", marketValue: "€42.00m", nationality: "England" },
      { name: "Alfie Devine", position: "Attacking Midfield", marketValue: "€3.50m", nationality: "England" },
      { name: "Heung-min Son", position: "Left Winger", marketValue: "€20.00m", nationality: "Korea, South" },
      { name: "Mikey Moore", position: "Left Winger", marketValue: "€18.00m", nationality: "England" },
      { name: "Bryan Gil", position: "Left Winger", marketValue: "€15.00m", nationality: "Spain" },
      { name: "Manor Solomon", position: "Left Winger", marketValue: "€14.00m", nationality: "Israel" },
      { name: "Mohammed Kudus", position: "Right Winger", marketValue: "€45.00m", nationality: "Ghana" },
      { name: "Brennan Johnson", position: "Right Winger", marketValue: "€40.00m", nationality: "Wales" },
      { name: "Wilson Odobert", position: "Right Winger", marketValue: "€20.00m", nationality: "France" },
      { name: "Min-hyeok Yang", position: "Right Winger", marketValue: "€3.50m", nationality: "Korea, South" },
      { name: "Dominic Solanke", position: "Centre-Forward", marketValue: "€40.00m", nationality: "England" },
      { name: "Mathys Tel", position: "Centre-Forward", marketValue: "€35.00m", nationality: "France" },
      { name: "Richarlison", position: "Centre-Forward", marketValue: "€20.00m", nationality: "Brazil" },
      { name: "Dane Scarlett", position: "Centre-Forward", marketValue: "€2.00m", nationality: "England" }
    ]
  },
  {
    name: "Manchester United",
    players: [
      { name: "André Onana", position: "Goalkeeper", marketValue: "€25.00m", nationality: "Cameroon" },
      { name: "Altay Bayındır", position: "Goalkeeper", marketValue: "€8.00m", nationality: "Türkiye" },
      { name: "Tom Heaton", position: "Goalkeeper", marketValue: "€200k", nationality: "England" },
      { name: "Leny Yoro", position: "Centre-Back", marketValue: "€55.00m", nationality: "France" },
      { name: "Lisandro Martínez", position: "Centre-Back", marketValue: "€40.00m", nationality: "Argentina" },
      { name: "Matthijs de Ligt", position: "Centre-Back", marketValue: "€38.00m", nationality: "Netherlands" },
      { name: "Harry Maguire", position: "Centre-Back", marketValue: "€13.00m", nationality: "England" },
      { name: "Ayden Heaven", position: "Centre-Back", marketValue: "€5.00m", nationality: "England" },
      { name: "Tyler Fredricson", position: "Centre-Back", marketValue: "€3.00m", nationality: "England" },
      { name: "Patrick Dorgu", position: "Left-Back", marketValue: "€25.00m", nationality: "Denmark" },
      { name: "Luke Shaw", position: "Left-Back", marketValue: "€12.00m", nationality: "England" },
      { name: "Tyrell Malacia", position: "Left-Back", marketValue: "€8.00m", nationality: "Netherlands" },
      { name: "Harry Amass", position: "Left-Back", marketValue: "€5.00m", nationality: "England" },
      { name: "Diego León", position: "Left-Back", marketValue: "€4.00m", nationality: "Paraguay" },
      { name: "Diogo Dalot", position: "Right-Back", marketValue: "€30.00m", nationality: "Portugal" },
      { name: "Noussair Mazraoui", position: "Right-Back", marketValue: "€25.00m", nationality: "Morocco" },
      { name: "Manuel Ugarte", position: "Defensive Midfield", marketValue: "€45.00m", nationality: "Uruguay" },
      { name: "Casemiro", position: "Defensive Midfield", marketValue: "€10.00m", nationality: "Brazil" },
      { name: "Toby Collyer", position: "Defensive Midfield", marketValue: "€5.00m", nationality: "England" },
      { name: "Kobbie Mainoo", position: "Central Midfield", marketValue: "€50.00m", nationality: "England" },
      { name: "Bruno Fernandes", position: "Attacking Midfield", marketValue: "€50.00m", nationality: "Portugal" },
      { name: "Mason Mount", position: "Attacking Midfield", marketValue: "€28.00m", nationality: "England" },
      { name: "Alejandro Garnacho", position: "Left Winger", marketValue: "€45.00m", nationality: "Argentina" },
      { name: "Jadon Sancho", position: "Left Winger", marketValue: "€28.00m", nationality: "England" },
      { name: "Bryan Mbeumo", position: "Right Winger", marketValue: "€55.00m", nationality: "Cameroon" },
      { name: "Amad Diallo", position: "Right Winger", marketValue: "€45.00m", nationality: "Cote d'Ivoire" },
      { name: "Antony", position: "Right Winger", marketValue: "€35.00m", nationality: "Brazil" },
      { name: "Rasmus Højlund", position: "Centre-Forward", marketValue: "€35.00m", nationality: "Denmark" },
      { name: "Matheus Cunha", position: "Centre-Forward", marketValue: "€60.00m", nationality: "Brazil" },
      { name: "Joshua Zirkzee", position: "Centre-Forward", marketValue: "€30.00m", nationality: "Netherlands" },
      { name: "Chido Obi", position: "Centre-Forward", marketValue: "€5.00m", nationality: "Denmark" },
      { name: "Ethan Wheatley", position: "Centre-Forward", marketValue: "€3.00m", nationality: "England" }
    ]
  },
  {
    name: "Newcastle United",
    players: [
      { name: "Nick Pope", position: "Goalkeeper", marketValue: "€8.00m", nationality: "England" },
      { name: "Odysseas Vlachodimos", position: "Goalkeeper", marketValue: "€5.00m", nationality: "Greece" },
      { name: "Martin Dúbravka", position: "Goalkeeper", marketValue: "€1.00m", nationality: "Slovakia" },
      { name: "Mark Gillespie", position: "Goalkeeper", marketValue: "€200k", nationality: "England" },
      { name: "Sven Botman", position: "Centre-Back", marketValue: "€42.00m", nationality: "Netherlands" },
      { name: "Fabian Schär", position: "Centre-Back", marketValue: "€7.00m", nationality: "Switzerland" },
      { name: "Dan Burn", position: "Centre-Back", marketValue: "€6.00m", nationality: "England" },
      { name: "Jamaal Lascelles", position: "Centre-Back", marketValue: "€4.00m", nationality: "England" },
      { name: "Lewis Hall", position: "Left-Back", marketValue: "€32.00m", nationality: "England" },
      { name: "Matt Targett", position: "Left-Back", marketValue: "€5.00m", nationality: "England" },
      { name: "Alex Murphy", position: "Left-Back", marketValue: "€300k", nationality: "Ireland" },
      { name: "Tino Livramento", position: "Right-Back", marketValue: "€40.00m", nationality: "England" },
      { name: "Kieran Trippier", position: "Right-Back", marketValue: "€4.00m", nationality: "England" },
      { name: "Emil Krafth", position: "Right-Back", marketValue: "€2.00m", nationality: "Sweden" },
      { name: "Harrison Ashby", position: "Right-Back", marketValue: "€1.40m", nationality: "Scotland" },
      { name: "Bruno Guimarães", position: "Defensive Midfield", marketValue: "€80.00m", nationality: "Brazil" },
      { name: "Isaac Hayden", position: "Defensive Midfield", marketValue: "€700k", nationality: "Jamaica" },
      { name: "Sandro Tonali", position: "Central Midfield", marketValue: "€60.00m", nationality: "Italy" },
      { name: "Joelinton", position: "Central Midfield", marketValue: "€35.00m", nationality: "Brazil" },
      { name: "Joe Willock", position: "Central Midfield", marketValue: "€22.00m", nationality: "England" },
      { name: "Lewis Miley", position: "Central Midfield", marketValue: "€22.00m", nationality: "England" },
      { name: "Joe White", position: "Attacking Midfield", marketValue: "€275k", nationality: "England" },
      { name: "Anthony Gordon", position: "Left Winger", marketValue: "€65.00m", nationality: "England" },
      { name: "Harvey Barnes", position: "Left Winger", marketValue: "€35.00m", nationality: "England" },
      { name: "Antoñito Cordero", position: "Left Winger", marketValue: "€2.00m", nationality: "Spain" },
      { name: "Anthony Elanga", position: "Right Winger", marketValue: "€42.00m", nationality: "Sweden" },
      { name: "Jacob Murphy", position: "Right Winger", marketValue: "€16.00m", nationality: "England" },
      { name: "Alexander Isak", position: "Centre-Forward", marketValue: "€120.00m", nationality: "Sweden" },
      { name: "William Osula", position: "Centre-Forward", marketValue: "€7.00m", nationality: "Denmark" }
    ]
  },
  {
    name: "Brighton & Hove Albion",
    players: [
      { name: "Bart Verbruggen", position: "Goalkeeper", marketValue: "€35.00m", nationality: "Netherlands" },
      { name: "Jason Steele", position: "Goalkeeper", marketValue: "€2.00m", nationality: "England" },
      { name: "Carl Rushworth", position: "Goalkeeper", marketValue: "€1.50m", nationality: "England" },
      { name: "Lewis Dunk", position: "Centre-Back", marketValue: "€15.00m", nationality: "England" },
      { name: "Adam Webster", position: "Centre-Back", marketValue: "€8.00m", nationality: "England" },
      { name: "Jan Paul van Hecke", position: "Centre-Back", marketValue: "€8.00m", nationality: "Netherlands" },
      { name: "Igor Julio", position: "Centre-Back", marketValue: "€7.00m", nationality: "Brazil" },
      { name: "Odel Offiah", position: "Centre-Back", marketValue: "€1.00m", nationality: "England" },
      { name: "Pervis Estupiñán", position: "Left-Back", marketValue: "€35.00m", nationality: "Ecuador" },
      { name: "Tariq Lamptey", position: "Right-Back", marketValue: "€12.00m", nationality: "Ghana" },
      { name: "Joël Veltman", position: "Right-Back", marketValue: "€4.00m", nationality: "Netherlands" },
      { name: "Valentín Barco", position: "Right-Back", marketValue: "€3.00m", nationality: "Argentina" },
      { name: "Billy Gilmour", position: "Defensive Midfield", marketValue: "€15.00m", nationality: "Scotland" },
      { name: "Mahmoud Dahoud", position: "Defensive Midfield", marketValue: "€8.00m", nationality: "Germany" },
      { name: "Pascal Groß", position: "Central Midfield", marketValue: "€8.00m", nationality: "Germany" },
      { name: "Adam Lallana", position: "Central Midfield", marketValue: "€1.00m", nationality: "England" },
      { name: "Jakub Moder", position: "Central Midfield", marketValue: "€1.00m", nationality: "Poland" },
      { name: "James Milner", position: "Central Midfield", marketValue: "€500k", nationality: "England" },
      { name: "Facundo Buonanotte", position: "Attacking Midfield", marketValue: "€25.00m", nationality: "Argentina" },
      { name: "Julio Enciso", position: "Attacking Midfield", marketValue: "€20.00m", nationality: "Paraguay" },
      { name: "Simon Adingra", position: "Left Winger", marketValue: "€35.00m", nationality: "Cote d'Ivoire" },
      { name: "Kaoru Mitoma", position: "Left Winger", marketValue: "€30.00m", nationality: "Japan" },
      { name: "Solly March", position: "Right Winger", marketValue: "€8.00m", nationality: "England" },
      { name: "Danny Welbeck", position: "Centre-Forward", marketValue: "€2.00m", nationality: "England" },
      { name: "Evan Ferguson", position: "Centre-Forward", marketValue: "€65.00m", nationality: "Ireland" },
      { name: "João Pedro", position: "Centre-Forward", marketValue: "€50.00m", nationality: "Brazil" },
      { name: "Ansu Fati", position: "Centre-Forward", marketValue: "€25.00m", nationality: "Spain" }
    ]
  },
  {
    name: "Aston Villa",
    players: [
      { name: "Emiliano Martínez", position: "Goalkeeper", marketValue: "€28.00m", nationality: "Argentina" },
      { name: "Robin Olsen", position: "Goalkeeper", marketValue: "€2.00m", nationality: "Sweden" },
      { name: "Joe Gauci", position: "Goalkeeper", marketValue: "€1.50m", nationality: "Australia" },
      { name: "Ezri Konsa", position: "Centre-Back", marketValue: "€35.00m", nationality: "England" },
      { name: "Diego Carlos", position: "Centre-Back", marketValue: "€15.00m", nationality: "Brazil" },
      { name: "Pau Torres", position: "Centre-Back", marketValue: "€12.00m", nationality: "Spain" },
      { name: "Clement Lenglet", position: "Centre-Back", marketValue: "€8.00m", nationality: "France" },
      { name: "Calum Chambers", position: "Centre-Back", marketValue: "€2.00m", nationality: "England" },
      { name: "Alex Moreno", position: "Left-Back", marketValue: "€15.00m", nationality: "Spain" },
      { name: "Lucas Digne", position: "Left-Back", marketValue: "€8.00m", nationality: "France" },
      { name: "Matty Cash", position: "Right-Back", marketValue: "€20.00m", nationality: "Poland" },
      { name: "Kaine Kesler-Hayden", position: "Right-Back", marketValue: "€2.00m", nationality: "England" },
      { name: "Boubacar Kamara", position: "Defensive Midfield", marketValue: "€40.00m", nationality: "France" },
      { name: "Douglas Luiz", position: "Central Midfield", marketValue: "€60.00m", nationality: "Brazil" },
      { name: "Youri Tielemans", position: "Central Midfield", marketValue: "€20.00m", nationality: "Belgium" },
      { name: "John McGinn", position: "Central Midfield", marketValue: "€18.00m", nationality: "Scotland" },
      { name: "Jacob Ramsey", position: "Central Midfield", marketValue: "€15.00m", nationality: "England" },
      { name: "Tim Iroegbunam", position: "Central Midfield", marketValue: "€8.00m", nationality: "England" },
      { name: "Emiliano Buendía", position: "Attacking Midfield", marketValue: "€15.00m", nationality: "Argentina" },
      { name: "Morgan Rogers", position: "Attacking Midfield", marketValue: "€12.00m", nationality: "England" },
      { name: "Leon Bailey", position: "Right Winger", marketValue: "€35.00m", nationality: "Jamaica" },
      { name: "Moussa Diaby", position: "Right Winger", marketValue: "€30.00m", nationality: "France" },
      { name: "Nicolò Zaniolo", position: "Right Winger", marketValue: "€15.00m", nationality: "Italy" },
      { name: "Ollie Watkins", position: "Centre-Forward", marketValue: "€55.00m", nationality: "England" },
      { name: "Jhon Durán", position: "Centre-Forward", marketValue: "€25.00m", nationality: "Colombia" },
      { name: "Cameron Archer", position: "Centre-Forward", marketValue: "€15.00m", nationality: "England" }
    ]
  },
  {
    name: "Crystal Palace",
    players: [
      { name: "Dean Henderson", position: "Goalkeeper", marketValue: "€15.00m", nationality: "England" },
      { name: "Sam Johnstone", position: "Goalkeeper", marketValue: "€8.00m", nationality: "England" },
      { name: "Remi Matthews", position: "Goalkeeper", marketValue: "€500k", nationality: "England" },
      { name: "Joachim Andersen", position: "Centre-Back", marketValue: "€25.00m", nationality: "Denmark" },
      { name: "Marc Guéhi", position: "Centre-Back", marketValue: "€25.00m", nationality: "England" },
      { name: "Chris Richards", position: "Centre-Back", marketValue: "€8.00m", nationality: "United States" },
      { name: "Nathaniel Clyne", position: "Centre-Back", marketValue: "€1.00m", nationality: "England" },
      { name: "Tyrick Mitchell", position: "Left-Back", marketValue: "€15.00m", nationality: "England" },
      { name: "Daniel Muñoz", position: "Right-Back", marketValue: "€12.00m", nationality: "Colombia" },
      { name: "Joel Ward", position: "Right-Back", marketValue: "€1.00m", nationality: "England" },
      { name: "Cheick Doucouré", position: "Defensive Midfield", marketValue: "€35.00m", nationality: "Mali" },
      { name: "Adam Wharton", position: "Central Midfield", marketValue: "€25.00m", nationality: "England" },
      { name: "Will Hughes", position: "Central Midfield", marketValue: "€8.00m", nationality: "England" },
      { name: "Jefferson Lerma", position: "Central Midfield", marketValue: "€8.00m", nationality: "Colombia" },
      { name: "Naouirou Ahamada", position: "Central Midfield", marketValue: "€5.00m", nationality: "France" },
      { name: "Eberechi Eze", position: "Attacking Midfield", marketValue: "€45.00m", nationality: "England" },
      { name: "Michael Olise", position: "Right Winger", marketValue: "€55.00m", nationality: "France" },
      { name: "Jordan Ayew", position: "Right Winger", marketValue: "€8.00m", nationality: "Ghana" },
      { name: "Odsonne Édouard", position: "Centre-Forward", marketValue: "€15.00m", nationality: "France" },
      { name: "Jean-Philippe Mateta", position: "Centre-Forward", marketValue: "€12.00m", nationality: "France" },
      { name: "Matheus França", position: "Centre-Forward", marketValue: "€8.00m", nationality: "Brazil" }
    ]
  },
  {
    name: "AFC Bournemouth",
    players: [
      { name: "Neto", position: "Goalkeeper", marketValue: "€8.00m", nationality: "Brazil" },
      { name: "Mark Travers", position: "Goalkeeper", marketValue: "€3.00m", nationality: "Ireland" },
      { name: "Darren Randolph", position: "Goalkeeper", marketValue: "€500k", nationality: "Ireland" },
      { name: "Lloyd Kelly", position: "Centre-Back", marketValue: "€15.00m", nationality: "England" },
      { name: "Chris Mepham", position: "Centre-Back", marketValue: "€8.00m", nationality: "Wales" },
      { name: "Marcos Senesi", position: "Centre-Back", marketValue: "€8.00m", nationality: "Argentina" },
      { name: "Ilya Zabarnyi", position: "Centre-Back", marketValue: "€8.00m", nationality: "Ukraine" },
      { name: "Milos Kerkez", position: "Left-Back", marketValue: "€45.00m", nationality: "Hungary" },
      { name: "Adam Smith", position: "Right-Back", marketValue: "€2.00m", nationality: "England" },
      { name: "Max Aarons", position: "Right-Back", marketValue: "€8.00m", nationality: "England" },
      { name: "Tyler Adams", position: "Defensive Midfield", marketValue: "€15.00m", nationality: "United States" },
      { name: "Philip Billing", position: "Central Midfield", marketValue: "€12.00m", nationality: "Denmark" },
      { name: "Lewis Cook", position: "Central Midfield", marketValue: "€8.00m", nationality: "England" },
      { name: "Ryan Christie", position: "Central Midfield", marketValue: "€8.00m", nationality: "Scotland" },
      { name: "Alex Scott", position: "Central Midfield", marketValue: "€8.00m", nationality: "England" },
      { name: "Marcus Tavernier", position: "Right Winger", marketValue: "€15.00m", nationality: "England" },
      { name: "Dango Ouattara", position: "Right Winger", marketValue: "€12.00m", nationality: "Burkina Faso" },
      { name: "Justin Kluivert", position: "Left Winger", marketValue: "€8.00m", nationality: "Netherlands" },
      { name: "Antoine Semenyo", position: "Centre-Forward", marketValue: "€12.00m", nationality: "Ghana" },
      { name: "Dominic Solanke", position: "Centre-Forward", marketValue: "€40.00m", nationality: "England" },
      { name: "Luis Sinisterra", position: "Centre-Forward", marketValue: "€15.00m", nationality: "Colombia" }
    ]
  },
  {
    name: "Nottingham Forest",
    players: [
      { name: "Matz Sels", position: "Goalkeeper", marketValue: "€8.00m", nationality: "Belgium" },
      { name: "Matt Turner", position: "Goalkeeper", marketValue: "€5.00m", nationality: "United States" },
      { name: "Wayne Hennessey", position: "Goalkeeper", marketValue: "€500k", nationality: "Wales" },
      { name: "Murillo", position: "Centre-Back", marketValue: "€25.00m", nationality: "Brazil" },
      { name: "Willy Boly", position: "Centre-Back", marketValue: "€8.00m", nationality: "Cote d'Ivoire" },
      { name: "Moussa Niakhaté", position: "Centre-Back", marketValue: "€8.00m", nationality: "Senegal" },
      { name: "Andrew Omobamidele", position: "Centre-Back", marketValue: "€5.00m", nationality: "Ireland" },
      { name: "Scott McKenna", position: "Centre-Back", marketValue: "€3.00m", nationality: "Scotland" },
      { name: "Harry Toffolo", position: "Left-Back", marketValue: "€5.00m", nationality: "England" },
      { name: "Neco Williams", position: "Right-Back", marketValue: "€8.00m", nationality: "Wales" },
      { name: "Gonzalo Montiel", position: "Right-Back", marketValue: "€8.00m", nationality: "Argentina" },
      { name: "Orel Mangala", position: "Defensive Midfield", marketValue: "€15.00m", nationality: "Belgium" },
      { name: "Ibrahim Sangaré", position: "Defensive Midfield", marketValue: "€15.00m", nationality: "Cote d'Ivoire" },
      { name: "Danilo", position: "Central Midfield", marketValue: "€15.00m", nationality: "Brazil" },
      { name: "Morgan Gibbs-White", position: "Central Midfield", marketValue: "€15.00m", nationality: "England" },
      { name: "Ryan Yates", position: "Central Midfield", marketValue: "€8.00m", nationality: "England" },
      { name: "Callum Hudson-Odoi", position: "Left Winger", marketValue: "€8.00m", nationality: "England" },
      { name: "Anthony Elanga", position: "Right Winger", marketValue: "€42.00m", nationality: "Sweden" },
      { name: "Divock Origi", position: "Centre-Forward", marketValue: "€8.00m", nationality: "Belgium" },
      { name: "Taiwo Awoniyi", position: "Centre-Forward", marketValue: "€15.00m", nationality: "Nigeria" },
      { name: "Chris Wood", position: "Centre-Forward", marketValue: "€5.00m", nationality: "New Zealand" }
    ]
  },
  {
    name: "Brentford",
    players: [
      { name: "Mark Flekken", position: "Goalkeeper", marketValue: "€12.00m", nationality: "Netherlands" },
      { name: "Thomas Strakosha", position: "Goalkeeper", marketValue: "€3.00m", nationality: "Albania" },
      { name: "Ellery Balcombe", position: "Goalkeeper", marketValue: "€1.00m", nationality: "England" },
      { name: "Ethan Pinnock", position: "Centre-Back", marketValue: "€15.00m", nationality: "Jamaica" },
      { name: "Nathan Collins", position: "Centre-Back", marketValue: "€12.00m", nationality: "Ireland" },
      { name: "Kristoffer Ajer", position: "Centre-Back", marketValue: "€8.00m", nationality: "Norway" },
      { name: "Ben Mee", position: "Centre-Back", marketValue: "€2.00m", nationality: "England" },
      { name: "Rico Henry", position: "Left-Back", marketValue: "€15.00m", nationality: "England" },
      { name: "Aaron Hickey", position: "Right-Back", marketValue: "€15.00m", nationality: "Scotland" },
      { name: "Mads Roerslev", position: "Right-Back", marketValue: "€8.00m", nationality: "Denmark" },
      { name: "Christian Nørgaard", position: "Defensive Midfield", marketValue: "€11.00m", nationality: "Denmark" },
      { name: "Vitaly Janelt", position: "Central Midfield", marketValue: "€12.00m", nationality: "Germany" },
      { name: "Mathias Jensen", position: "Central Midfield", marketValue: "€8.00m", nationality: "Denmark" },
      { name: "Frank Onyeka", position: "Central Midfield", marketValue: "€8.00m", nationality: "Nigeria" },
      { name: "Josh Dasilva", position: "Central Midfield", marketValue: "€5.00m", nationality: "England" },
      { name: "Shandon Baptiste", position: "Central Midfield", marketValue: "€3.00m", nationality: "Grenada" },
      { name: "Keane Lewis-Potter", position: "Left Winger", marketValue: "€8.00m", nationality: "England" },
      { name: "Yoane Wissa", position: "Left Winger", marketValue: "€8.00m", nationality: "DR Congo" },
      { name: "Ivan Toney", position: "Centre-Forward", marketValue: "€35.00m", nationality: "England" },
      { name: "Neal Maupay", position: "Centre-Forward", marketValue: "€8.00m", nationality: "France" }
    ]
  },
  {
    name: "West Ham United",
    players: [
      { name: "Alphonse Areola", position: "Goalkeeper", marketValue: "€12.00m", nationality: "France" },
      { name: "Łukasz Fabiański", position: "Goalkeeper", marketValue: "€1.00m", nationality: "Poland" },
      { name: "Joseph Anang", position: "Goalkeeper", marketValue: "€500k", nationality: "England" },
      { name: "Kurt Zouma", position: "Centre-Back", marketValue: "€15.00m", nationality: "France" },
      { name: "Nayef Aguerd", position: "Centre-Back", marketValue: "€15.00m", nationality: "Morocco" },
      { name: "Angelo Ogbonna", position: "Centre-Back", marketValue: "€2.00m", nationality: "Italy" },
      { name: "Konstantinos Mavropanos", position: "Centre-Back", marketValue: "€8.00m", nationality: "Greece" },
      { name: "Emerson", position: "Left-Back", marketValue: "€15.00m", nationality: "Italy" },
      { name: "Aaron Cresswell", position: "Left-Back", marketValue: "€2.00m", nationality: "England" },
      { name: "Vladimír Coufal", position: "Right-Back", marketValue: "€8.00m", nationality: "Czech Republic" },
      { name: "Ben Johnson", position: "Right-Back", marketValue: "€5.00m", nationality: "England" },
      { name: "Edson Álvarez", position: "Defensive Midfield", marketValue: "€25.00m", nationality: "Mexico" },
      { name: "Tomáš Souček", position: "Central Midfield", marketValue: "€15.00m", nationality: "Czech Republic" },
      { name: "James Ward-Prowse", position: "Central Midfield", marketValue: "€12.00m", nationality: "England" },
      { name: "Lucas Paquetá", position: "Central Midfield", marketValue: "€35.00m", nationality: "Brazil" },
      { name: "Flynn Downes", position: "Central Midfield", marketValue: "€8.00m", nationality: "England" },
      { name: "Kalvin Phillips", position: "Central Midfield", marketValue: "€12.00m", nationality: "England" },
      { name: "Jarrod Bowen", position: "Right Winger", marketValue: "€35.00m", nationality: "England" },
      { name: "Maxwel Cornet", position: "Left Winger", marketValue: "€8.00m", nationality: "Cote d'Ivoire" },
      { name: "Pablo Fornals", position: "Left Winger", marketValue: "€8.00m", nationality: "Spain" },
      { name: "Michail Antonio", position: "Centre-Forward", marketValue: "€5.00m", nationality: "Jamaica" },
      { name: "Danny Ings", position: "Centre-Forward", marketValue: "€3.00m", nationality: "England" },
      { name: "Divin Mubama", position: "Centre-Forward", marketValue: "€2.00m", nationality: "England" }
    ]
  },
  {
    name: "Fulham",
    players: [
      { name: "Bernd Leno", position: "Goalkeeper", marketValue: "€15.00m", nationality: "Germany" },
      { name: "Marek Rodák", position: "Goalkeeper", marketValue: "€3.00m", nationality: "Slovakia" },
      { name: "Steven Benda", position: "Goalkeeper", marketValue: "€1.00m", nationality: "Wales" },
      { name: "Tosin Adarabioyo", position: "Centre-Back", marketValue: "€20.00m", nationality: "England" },
      { name: "Calvin Bassey", position: "Centre-Back", marketValue: "€15.00m", nationality: "Nigeria" },
      { name: "Issa Diop", position: "Centre-Back", marketValue: "€8.00m", nationality: "France" },
      { name: "Tim Ream", position: "Centre-Back", marketValue: "€1.00m", nationality: "United States" },
      { name: "Antonee Robinson", position: "Left-Back", marketValue: "€15.00m", nationality: "United States" },
      { name: "Fodé Ballo-Touré", position: "Left-Back", marketValue: "€5.00m", nationality: "Senegal" },
      { name: "Kenny Tete", position: "Right-Back", marketValue: "€8.00m", nationality: "Netherlands" },
      { name: "João Palhinha", position: "Defensive Midfield", marketValue: "€45.00m", nationality: "Portugal" },
      { name: "Harrison Reed", position: "Central Midfield", marketValue: "€8.00m", nationality: "England" },
      { name: "Tom Cairney", position: "Central Midfield", marketValue: "€3.00m", nationality: "Scotland" },
      { name: "Andreas Pereira", position: "Central Midfield", marketValue: "€8.00m", nationality: "Brazil" },
      { name: "Sasa Lukic", position: "Central Midfield", marketValue: "€8.00m", nationality: "Serbia" },
      { name: "Willian", position: "Left Winger", marketValue: "€3.00m", nationality: "Brazil" },
      { name: "Harry Wilson", position: "Right Winger", marketValue: "€8.00m", nationality: "Wales" },
      { name: "Bobby De Cordova-Reid", position: "Right Winger", marketValue: "€5.00m", nationality: "Jamaica" },
      { name: "Adama Traoré", position: "Right Winger", marketValue: "€8.00m", nationality: "Spain" },
      { name: "Raúl Jiménez", position: "Centre-Forward", marketValue: "€5.00m", nationality: "Mexico" },
      { name: "Rodrigo Muniz", position: "Centre-Forward", marketValue: "€8.00m", nationality: "Brazil" },
      { name: "Carlos Vinícius", position: "Centre-Forward", marketValue: "€5.00m", nationality: "Brazil" }
    ]
  },
  {
    name: "Wolverhampton Wanderers",
    players: [
      { name: "José Sá", position: "Goalkeeper", marketValue: "€15.00m", nationality: "Portugal" },
      { name: "Daniel Bentley", position: "Goalkeeper", marketValue: "€2.00m", nationality: "England" },
      { name: "Tom King", position: "Goalkeeper", marketValue: "€500k", nationality: "Wales" },
      { name: "Max Kilman", position: "Centre-Back", marketValue: "€25.00m", nationality: "England" },
      { name: "Craig Dawson", position: "Centre-Back", marketValue: "€3.00m", nationality: "England" },
      { name: "Toti Gomes", position: "Centre-Back", marketValue: "€8.00m", nationality: "Portugal" },
      { name: "Santiago Bueno", position: "Centre-Back", marketValue: "€8.00m", nationality: "Uruguay" },
      { name: "Rayan Aït-Nouri", position: "Left-Back", marketValue: "€35.00m", nationality: "Algeria" },
      { name: "Hugo Bueno", position: "Left-Back", marketValue: "€8.00m", nationality: "Spain" },
      { name: "Nélson Semedo", position: "Right-Back", marketValue: "€12.00m", nationality: "Portugal" },
      { name: "Matt Doherty", position: "Right-Back", marketValue: "€2.00m", nationality: "Ireland" },
      { name: "Mario Lemina", position: "Defensive Midfield", marketValue: "€12.00m", nationality: "Gabon" },
      { name: "João Gomes", position: "Central Midfield", marketValue: "€25.00m", nationality: "Brazil" },
      { name: "Rúben Neves", position: "Central Midfield", marketValue: "€35.00m", nationality: "Portugal" },
      { name: "Boubacar Traoré", position: "Central Midfield", marketValue: "€8.00m", nationality: "Mali" },
      { name: "Tommy Doyle", position: "Central Midfield", marketValue: "€8.00m", nationality: "England" },
      { name: "Jean-Ricner Bellegarde", position: "Attacking Midfield", marketValue: "€15.00m", nationality: "France" },
      { name: "Pablo Sarabia", position: "Right Winger", marketValue: "€8.00m", nationality: "Spain" },
      { name: "Pedro Neto", position: "Right Winger", marketValue: "€50.00m", nationality: "Portugal" },
      { name: "Hwang Hee-chan", position: "Left Winger", marketValue: "€15.00m", nationality: "Korea, South" },
      { name: "Sasa Kalajdzic", position: "Centre-Forward", marketValue: "€8.00m", nationality: "Austria" },
      { name: "Fábio Silva", position: "Centre-Forward", marketValue: "€8.00m", nationality: "Portugal" }
    ]
  },
  {
    name: "Everton",
    players: [
      { name: "Jordan Pickford", position: "Goalkeeper", marketValue: "€15.00m", nationality: "England" },
      { name: "João Virgínia", position: "Goalkeeper", marketValue: "€2.00m", nationality: "Portugal" },
      { name: "Andy Lonergan", position: "Goalkeeper", marketValue: "€200k", nationality: "England" },
      { name: "James Tarkowski", position: "Centre-Back", marketValue: "€12.00m", nationality: "England" },
      { name: "Jarrad Branthwaite", position: "Centre-Back", marketValue: "€35.00m", nationality: "England" },
      { name: "Michael Keane", position: "Centre-Back", marketValue: "€5.00m", nationality: "England" },
      { name: "Ben Godfrey", position: "Centre-Back", marketValue: "€8.00m", nationality: "England" },
      { name: "Vitaliy Mykolenko", position: "Left-Back", marketValue: "€12.00m", nationality: "Ukraine" },
      { name: "Ashley Young", position: "Right-Back", marketValue: "€1.00m", nationality: "England" },
      { name: "Seamus Coleman", position: "Right-Back", marketValue: "€1.00m", nationality: "Ireland" },
      { name: "Nathan Patterson", position: "Right-Back", marketValue: "€8.00m", nationality: "Scotland" },
      { name: "Amadou Onana", position: "Defensive Midfield", marketValue: "€35.00m", nationality: "Belgium" },
      { name: "Idrissa Gueye", position: "Central Midfield", marketValue: "€5.00m", nationality: "Senegal" },
      { name: "James Garner", position: "Central Midfield", marketValue: "€15.00m", nationality: "England" },
      { name: "Abdoulaye Doucouré", position: "Central Midfield", marketValue: "€12.00m", nationality: "Mali" },
      { name: "André Gomes", position: "Central Midfield", marketValue: "€3.00m", nationality: "Portugal" },
      { name: "Dele Alli", position: "Attacking Midfield", marketValue: "€2.00m", nationality: "England" },
      { name: "Dwight McNeil", position: "Left Winger", marketValue: "€15.00m", nationality: "England" },
      { name: "Jack Harrison", position: "Right Winger", marketValue: "€12.00m", nationality: "England" },
      { name: "Arnaut Danjuma", position: "Left Winger", marketValue: "€8.00m", nationality: "Netherlands" },
      { name: "Dominic Calvert-Lewin", position: "Centre-Forward", marketValue: "€15.00m", nationality: "England" },
      { name: "Beto", position: "Centre-Forward", marketValue: "€12.00m", nationality: "Portugal" },
      { name: "Youssef Chermiti", position: "Centre-Forward", marketValue: "€8.00m", nationality: "Portugal" }
    ]
  },
  {
    name: "Leeds United",
    players: [
      { name: "Illan Meslier", position: "Goalkeeper", marketValue: "€20.00m", nationality: "France" },
      { name: "Karl Darlow", position: "Goalkeeper", marketValue: "€3.00m", nationality: "England" },
      { name: "Kristoffer Klaesson", position: "Goalkeeper", marketValue: "€1.00m", nationality: "Norway" },
      { name: "Pascal Struijk", position: "Centre-Back", marketValue: "€15.00m", nationality: "Netherlands" },
      { name: "Liam Cooper", position: "Centre-Back", marketValue: "€3.00m", nationality: "Scotland" },
      { name: "Charlie Cresswell", position: "Centre-Back", marketValue: "€8.00m", nationality: "England" },
      { name: "Joe Rodon", position: "Centre-Back", marketValue: "€8.00m", nationality: "Wales" },
      { name: "Junior Firpo", position: "Left-Back", marketValue: "€8.00m", nationality: "Dominican Republic" },
      { name: "Sam Byram", position: "Right-Back", marketValue: "€2.00m", nationality: "England" },
      { name: "Luke Ayling", position: "Right-Back", marketValue: "€2.00m", nationality: "England" },
      { name: "Ethan Ampadu", position: "Defensive Midfield", marketValue: "€15.00m", nationality: "Wales" },
      { name: "Glen Kamara", position: "Central Midfield", marketValue: "€8.00m", nationality: "Finland" },
      { name: "Ilia Gruev", position: "Central Midfield", marketValue: "€8.00m", nationality: "Bulgaria" },
      { name: "Harry Gray", position: "Central Midfield", marketValue: "€5.00m", nationality: "England" },
      { name: "Crysencio Summerville", position: "Left Winger", marketValue: "€25.00m", nationality: "Netherlands" },
      { name: "Wilfried Gnonto", position: "Right Winger", marketValue: "€20.00m", nationality: "Italy" },
      { name: "Daniel James", position: "Right Winger", marketValue: "€8.00m", nationality: "Wales" },
      { name: "Georginio Rutter", position: "Centre-Forward", marketValue: "€15.00m", nationality: "France" },
      { name: "Patrick Bamford", position: "Centre-Forward", marketValue: "€5.00m", nationality: "England" },
      { name: "Joel Piroe", position: "Centre-Forward", marketValue: "€12.00m", nationality: "Netherlands" }
    ]
  },
  {
    name: "Burnley",
    players: [
      { name: "James Trafford", position: "Goalkeeper", marketValue: "€15.00m", nationality: "England" },
      { name: "Arijanet Muric", position: "Goalkeeper", marketValue: "€5.00m", nationality: "Kosovo" },
      { name: "Lawrence Vigouroux", position: "Goalkeeper", marketValue: "€1.00m", nationality: "England" },
      { name: "Dara O'Shea", position: "Centre-Back", marketValue: "€8.00m", nationality: "Ireland" },
      { name: "Jordan Beyer", position: "Centre-Back", marketValue: "€8.00m", nationality: "Germany" },
      { name: "Hjalmar Ekdal", position: "Centre-Back", marketValue: "€5.00m", nationality: "Sweden" },
      { name: "Ameen Al-Dakhil", position: "Centre-Back", marketValue: "€5.00m", nationality: "Iraq" },
      { name: "Charlie Taylor", position: "Left-Back", marketValue: "€3.00m", nationality: "England" },
      { name: "Vitinho", position: "Right-Back", marketValue: "€5.00m", nationality: "Brazil" },
      { name: "Connor Roberts", position: "Right-Back", marketValue: "€3.00m", nationality: "Wales" },
      { name: "Josh Cullen", position: "Defensive Midfield", marketValue: "€8.00m", nationality: "Ireland" },
      { name: "Sander Berge", position: "Central Midfield", marketValue: "€12.00m", nationality: "Norway" },
      { name: "Jack Cork", position: "Central Midfield", marketValue: "€1.00m", nationality: "England" },
      { name: "Josh Brownhill", position: "Central Midfield", marketValue: "€8.00m", nationality: "England" },
      { name: "Aaron Ramsey", position: "Central Midfield", marketValue: "€5.00m", nationality: "England" },
      { name: "Wilson Odobert", position: "Left Winger", marketValue: "€20.00m", nationality: "France" },
      { name: "Anass Zaroury", position: "Left Winger", marketValue: "€8.00m", nationality: "Morocco" },
      { name: "Manuel Benson", position: "Right Winger", marketValue: "€8.00m", nationality: "Belgium" },
      { name: "Jóhann Berg Guðmundsson", position: "Right Winger", marketValue: "€2.00m", nationality: "Iceland" },
      { name: "Lyle Foster", position: "Centre-Forward", marketValue: "€12.00m", nationality: "South Africa" },
      { name: "Zeki Amdouni", position: "Centre-Forward", marketValue: "€15.00m", nationality: "Switzerland" },
      { name: "Jay Rodriguez", position: "Centre-Forward", marketValue: "€1.00m", nationality: "England" }
    ]
  },
  {
    name: "Sunderland",
    players: [
      { name: "Anthony Patterson", position: "Goalkeeper", marketValue: "€8.00m", nationality: "England" },
      { name: "Nathan Bishop", position: "Goalkeeper", marketValue: "€1.00m", nationality: "England" },
      { name: "Alex Bass", position: "Goalkeeper", marketValue: "€500k", nationality: "England" },
      { name: "Dan Ballard", position: "Centre-Back", marketValue: "€8.00m", nationality: "Northern Ireland" },
      { name: "Luke O'Nien", position: "Centre-Back", marketValue: "€3.00m", nationality: "England" },
      { name: "Trai Hume", position: "Centre-Back", marketValue: "€5.00m", nationality: "Northern Ireland" },
      { name: "Jenson Seelt", position: "Centre-Back", marketValue: "€3.00m", nationality: "Netherlands" },
      { name: "Niall Huggins", position: "Left-Back", marketValue: "€2.00m", nationality: "Wales" },
      { name: "Dennis Cirkin", position: "Left-Back", marketValue: "€3.00m", nationality: "England" },
      { name: "Timothée Pembélé", position: "Right-Back", marketValue: "€5.00m", nationality: "France" },
      { name: "Pierre Ekwah", position: "Defensive Midfield", marketValue: "€8.00m", nationality: "France" },
      { name: "Dan Neil", position: "Central Midfield", marketValue: "€8.00m", nationality: "England" },
      { name: "Corry Evans", position: "Central Midfield", marketValue: "€1.00m", nationality: "Northern Ireland" },
      { name: "Alex Pritchard", position: "Central Midfield", marketValue: "€2.00m", nationality: "England" },
      { name: "Patrick Roberts", position: "Right Winger", marketValue: "€5.00m", nationality: "England" },
      { name: "Jack Clarke", position: "Left Winger", marketValue: "€12.00m", nationality: "England" },
      { name: "Abdoullah Ba", position: "Left Winger", marketValue: "€3.00m", nationality: "France" },
      { name: "Adil Aouchiche", position: "Attacking Midfield", marketValue: "€5.00m", nationality: "France" },
      { name: "Jobe Bellingham", position: "Attacking Midfield", marketValue: "€15.00m", nationality: "England" },
      { name: "Nazariy Rusyn", position: "Centre-Forward", marketValue: "€5.00m", nationality: "Ukraine" },
      { name: "Mason Burstow", position: "Centre-Forward", marketValue: "€3.00m", nationality: "England" },
      { name: "Eliezer Mayenda", position: "Centre-Forward", marketValue: "€2.00m", nationality: "Spain" }
    ]
  }
];

export async function GET() {
  try {
    const debugInfo: string[] = [];
    debugInfo.push('Starting 2025 player seeding...');
    
    // Clear existing players first
    await supabase.from('players').delete().neq('id', 0);
    debugInfo.push('Cleared existing players');
    
    let totalPlayers = 0;
    const errors: string[] = [];
    
    // Process each team
    for (const team of teamsData) {
      debugInfo.push(`Processing team: ${team.name} (${team.players.length} players)`);
      
      // Process each player in the team
      for (const player of team.players) {
        try {
          const playerData = {
            name: player.name,
            club: team.name,
            position: mapPosition(player.position),
            price: convertMarketValueToFPLPrice(player.marketValue),
            nationality: player.nationality,
            jersey_number: null // We don't have jersey numbers in the provided data
          };
          
          const { error } = await supabase.from('players').insert(playerData);
          if (!error) {
            totalPlayers++;
            debugInfo.push(`Successfully inserted player: ${player.name} (${team.name})`);
          } else {
            errors.push(`Error inserting player ${player.name}: ${error.message}`);
          }
        } catch (error) {
          errors.push(`Error processing ${player.name}: ${error}`);
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${totalPlayers} players from ${teamsData.length} teams`,
      debug: debugInfo,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 