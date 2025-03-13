#!/usr/bin/env python3
# BLOCKERA ALLA VARNINGAR OCH ERROR-OUTPUTS
import os
import sys
import warnings
import re

# 1. Tvinga docling att använda CPU
os.environ['FORCE_CPU'] = "1"

# 2. Blockera stderr-utdata helt
class NullWriter:
    def write(self, text): pass
    def flush(self): pass
original_stderr = sys.stderr
sys.stderr = NullWriter()

# 3. Ignorera alla varningar
warnings.filterwarnings('ignore')

# 4. Importera nödvändiga bibliotek
import torch
from pathlib import Path
from docling.document_converter import DocumentConverter
from transformers import pipeline, AutoTokenizer, AutoModelForTokenClassification

def create_ner_pipeline():
    """Skapa och returnera en NER-pipeline som använder GPU om möjligt, annars CPU"""
    from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline
    
    print("\nAnvänder svensk NER-modell...")
    
    # Använd den svenska NER-modellen
    tokenizer = AutoTokenizer.from_pretrained("KBLab/bert-base-swedish-cased-ner", local_files_only=False)
    model = AutoModelForTokenClassification.from_pretrained("KBLab/bert-base-swedish-cased-ner", local_files_only=False)
    
    # Försök att använda GPU om den är tillgänglig
    device = 0 if torch.cuda.is_available() else -1
    print("NER använder GPU" if device >= 0 else "NER använder CPU")
    
    # Skapa pipeline med explicit modell och tokenizer
    ner_pipeline = pipeline(
        'ner',
        model=model,
        tokenizer=tokenizer,
        device=device,
        aggregation_strategy="simple"
    )
    
    return ner_pipeline

def remove_overlapping_entities(entities):
    """Ta bort överlappande entiteter, behåll den med högst score"""
    if not entities:
        return []
    
    # Sortera entiteter efter score (högst först)
    sorted_entities = sorted(entities, key=lambda x: x['score'], reverse=True)
    
    # Lista för att hålla reda på vilka områden som redan är "täckta"
    covered_ranges = []
    filtered_entities = []
    
    for entity in sorted_entities:
        start = entity['start']
        end = entity['end']
        
        # Kontrollera om denna entitet överlappar med någon redan täckt
        overlap = False
        for cstart, cend in covered_ranges:
            # Om det finns någon överlappning
            if (start <= cend and end >= cstart):
                overlap = True
                break
        
        if not overlap:
            filtered_entities.append(entity)
            covered_ranges.append((start, end))
    
    # Sortera tillbaka efter position (bakifrån)
    return sorted(filtered_entities, key=lambda x: x['start'], reverse=True)

def censurering_text(text, ner_pipeline, confidence_threshold=0.5, callback=None):
    """Identifiera och censurering alla NER med confidence över threshold"""
    # Dela texten i mindre bitar för att hantera långa texter
    chunk_size = 512
    stride = 384  # Överlappning mellan chunks
    
    # Behandla varje chunk
    all_entities = []
    
    # Gå igenom texten med överlappande fönster
    for i in range(0, len(text), stride):
        # Extrahera chunk och spara dess startposition
        chunk = text[i:i+chunk_size]
        chunk_start = i
        
        if not chunk.strip():  # Hoppa över tomma chunks
            continue
        
        # Kör NER på den aktuella chunken
        entities = ner_pipeline(chunk)
        
        # Spara bara entiteter med tillräckligt hög confidence
        for e in entities:
            if e['score'] >= confidence_threshold:
                # Anropa callback-funktionen om den är angiven
                if callback:
                    callback(e)
                    
                # Justera start/end positioner relativt till hela texten
                e['start'] += chunk_start
                e['end'] += chunk_start
                all_entities.append(e)
    
    # Ta bort överlappande entiteter (behåll de med högst score)
    filtered_entities = remove_overlapping_entities(all_entities)
    
    # Ersätt alla entiteter med asterisker
    censored_text = text
    for entity in filtered_entities:
        # Kontrollera att start/end positioner är inom textens gränser
        start = max(0, min(entity['start'], len(text)))
        end = max(0, min(entity['end'], len(text)))
        
        if start >= end:
            continue  # Ogiltig position
            
        word = text[start:end]
        censored = '*' * len(word)  # Skapa lika många asterisker som längden på ordet
        censored_text = censored_text[:start] + censored + censored_text[end:]
        
        # Skriv ut vad som censurerades (för debugging)
        print(f"Censurerat: '{word}' ({entity['entity_group']}) - confidence: {entity['score']:.2f}")
    
    return censored_text

def censor_personal_data(text):
    """
    Identifierar och censurerar svensk personlig information:
    - Telefonnummer (olika format)
    - Personnummer (ÅÅÅÅMMDD-XXXX eller ÅÅMMDD-XXXX)
    - E-postadresser
    
    Returnerar:
    - Censurerad text
    - Lista med alla censurerade enheter (för loggning)
    """
    import re
    
    censored_items = []
    censored_text = text
    
    # 1. E-postadresser
    # Format: namn@domän.tld
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b'
    
    # 2. Telefonnummer (svenska format)
    # Hanterar format som:
    # 07X-XXX XX XX, 07XXXXXXXX, 07X XXX XX XX, +467XXXXXXXX, +46 7X XXX XX XX
    phone_patterns = [
        r'\b(?:\+46|0)(?:[\s-])?7[0-9](?:[\s-])?[0-9]{3}(?:[\s-])?[0-9]{2}(?:[\s-])?[0-9]{2}\b',  # Mobilnummer
        r'\b(?:\+46|0)(?:[\s-])?[1-9][0-9]{0,2}(?:[\s-])?[0-9]{3}(?:[\s-])?[0-9]{2}(?:[\s-])?[0-9]{2}\b',  # Fasta nummer
        r'\b(?:\+46|0)(?:[\s-])?[1-9](?:[\s-])?[0-9]{2}(?:[\s-])?[0-9]{3}(?:[\s-])?[0-9]{2}(?:[\s-])?[0-9]{2}\b',  # Växel/företag
    ]
    
    # 3. Personnummer
    # Format: ÅÅÅÅMMDD-XXXX eller ÅÅMMDD-XXXX
    # Även utan bindestreck
    personal_id_patterns = [
        r'\b[1-2][0-9]{3}(?:0[1-9]|1[0-2])(?:0[1-9]|[1-2][0-9]|3[0-1])[-]?[0-9]{4}\b',  # ÅÅÅÅMMDD-XXXX
        r'\b(?:[0-9]{2})(?:0[1-9]|1[0-2])(?:0[1-9]|[1-2][0-9]|3[0-1])[-]?[0-9]{4}\b',   # ÅÅMMDD-XXXX
    ]
    
    # Funktion för att censurering med asterisker
    def replace_with_stars(match):
        matched_text = match.group(0)
        censored_items.append(matched_text)
        return '*' * len(matched_text)
    
    # Censurering e-postadresser
    censored_text = re.sub(email_pattern, replace_with_stars, censored_text)
    
    # Censurering telefonnummer
    for pattern in phone_patterns:
        censored_text = re.sub(pattern, replace_with_stars, censored_text)
    
    # Censurering personnummer
    for pattern in personal_id_patterns:
        censored_text = re.sub(pattern, replace_with_stars, censored_text)
    
    return censored_text, censored_items

def main2(pdf_path, output_file):
    # 1. Konvertera PDF till text
    print("\n=== STEG 1: PDF-KONVERTERING ===")

    # Om pdf_path inte är specificerad, använd default
    if pdf_path is None:
        pdf_path = Path("CV.pdf")  # Använd relativ sökväg till filen i aktuell mapp
    elif isinstance(pdf_path, str):
        pdf_path = Path(pdf_path)

    if not pdf_path.exists():
        print(f"ERROR: Filen '{pdf_path}' hittades inte!")
        return

    print(f"Konverterar PDF: {pdf_path.absolute()}")
    converter = DocumentConverter()

    try:
        result = converter.convert(pdf_path)

        # Hämta både text och markdown från docling
        plain_text = result.document.export_to_text()
        markdown_text = result.document.export_to_markdown()

        print(f"PDF konverterad: {len(result.document.pages)} sidor")

        # 2. Censurering personlig information med regex
        print("\n=== STEG 2: CENSURERING AV PERSONUPPGIFTER ===")
        plain_text_censored, censored_personal_data = censor_personal_data(plain_text)
        markdown_censored, _ = censor_personal_data(markdown_text)

        if censored_personal_data:
            print(f"Hittade och censurerade {len(censored_personal_data)} personuppgifter:")
            for i, item in enumerate(censored_personal_data[:5]):  # Visa max 5 exempel
                print(f"  - {item}")
            if len(censored_personal_data) > 5:
                print(f"  ...och {len(censored_personal_data) - 5} till")
        else:
            print("Inga personuppgifter hittades med regex-sökning.")

        # 3. Kör NER för att identifiera entiteter
        print("\n=== STEG 3: NER-ANALYS OCH CENSURERING ===")
        ner_pipeline = create_ner_pipeline()

        # Kör NER på båda versionerna för konsistens
        censored_text = censurering_text(plain_text_censored, ner_pipeline, confidence_threshold=0.7)

        # Extrahera all text från markdown för att köra NER på den också
        from bs4 import BeautifulSoup

        # Funktion för att få ren text från markdown för att köra NER
        def extract_plain_text_from_markdown(markdown):
            # För enkel markdown, ta bort vanliga markörer
            text = markdown.replace('#', ' ').replace('*', ' ').replace('_', ' ')
            text = text.replace('```', ' ').replace('`', ' ')
            text = text.replace('>', ' ')

            # Ta bort alla HTML-taggar med BeautifulSoup om det finns
            if '<' in text and '>' in text:
                try:
                    soup = BeautifulSoup(text, 'html.parser')
                    text = soup.get_text()
                except:
                    pass  # Fallback om det inte finns BeautifulSoup

            return text

        # Hämta lista över NER-enheter
        ner_entities = []
        def collect_entities(entity):
            word = entity['word']
            score = entity['score']
            entity_type = entity['entity_group']
            ner_entities.append((word, score, entity_type))

        # Kör NER direkt på markdown-texten (efter regex-censurering)
        markdown_plain = extract_plain_text_from_markdown(markdown_censored)
        _ = censurering_text(markdown_plain, ner_pipeline, confidence_threshold=0.7,
                             callback=collect_entities)

        # Logga vilka entiteter vi hittade
        if ner_entities:
            print(f"NER identifierade {len(ner_entities)} enheter:")
            for i, (word, score, ent_type) in enumerate(ner_entities[:5]):
                print(f"  - '{word}' ({ent_type}) - confidence: {score:.2f}")
            if len(ner_entities) > 5:
                print(f"  ...och {len(ner_entities) - 5} till")

        # Censurering av alla identifierade NER-entiteter i markdown
        for word, score, _ in ner_entities:
            if len(word) >= 3:  # Bara ersätt ord som är minst 3 tecken
                markdown_censored = markdown_censored.replace(word, '*' * len(word))

        # 4. Spara resultaten
        print("\n=== STEG 4: SPARA RESULTAT ===")

        # Basera utfilnamn på infilnamnet
        base_name = pdf_path.stem


        # Spara originaltexten
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(plain_text)

        # 5. Visa exempelutdrag
        print("\nExempel på censurerad text:")
        print("-" * 50)
        print(censored_text[:500] + "..." if len(censored_text) > 500 else censored_text)
        print("-" * 50)
        print(f"\nResultat sparade till:")

        return {
            "original_text": plain_text,
            "censored_text": censored_text,
            "original_markdown": markdown_text,
            "censored_markdown": markdown_censored,
        }

    except Exception as e:
        print(f"Ett fel uppstod vid bearbetning av PDF: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    import sys
    import argparse
    
    # Skapa en argument parser för kommandoradsargument
    parser = argparse.ArgumentParser(description='Konvertera PDF till text och censurerar personuppgifter.')
    parser.add_argument('file', nargs='?', help='PDF-fil att bearbeta')
    
    args = parser.parse_args()
    
    if args.file:
        print(f"Bearbetar fil: {args.file}")
        main(args.file)
    else:
        print("Använder standardfil: 2.pdf")
        main()
    
    print("\nCensureringsprocessen är klar!") 