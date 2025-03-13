#!/usr/bin/env python3
# BLOCKERA ALLA VARNINGAR OCH ERROR-OUTPUTS
import os
import sys
import warnings
import re
import uuid  # Lägg till import för att generera unika ID:n

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
    
    print("\nAnvänder engelsk NER-modell...")
    
    # Använd den engelska NER-modellen
    tokenizer = AutoTokenizer.from_pretrained("dslim/bert-large-NER", local_files_only=False)
    model = AutoModelForTokenClassification.from_pretrained("dslim/bert-large-NER", local_files_only=False)
    
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

def merge_nearby_entities(entities, max_distance=2):
    """
    Sammanslå entiteter som ligger nära varandra och sannolikt tillhör samma ord eller fras.
    
    Args:
        entities: Lista med entiteter
        max_distance: Maximalt avstånd mellan entiteter som ska slås ihop
        
    Returns:
        Lista med sammanslagna entiteter
    """
    if not entities:
        return []
    
    # Sortera entiteterna efter startposition
    sorted_entities = sorted(entities, key=lambda x: x['start'])
    merged_entities = []
    
    i = 0
    while i < len(sorted_entities):
        current = sorted_entities[i]
        
        # Sök efter den nästa entiteten som är inom det maximala avståndet
        if i + 1 < len(sorted_entities):
            next_entity = sorted_entities[i + 1]
            
            # Om nästa entitet är tillräckligt nära och har samma entitetstyp
            if (next_entity['start'] - current['end'] <= max_distance and 
                next_entity['entity_group'] == current['entity_group']):
                
                # Skapa en ny sammanfogad entitet
                merged = current.copy()
                merged['end'] = next_entity['end']
                merged['word'] = current['word'] + next_entity['word']
                merged['score'] = (current['score'] + next_entity['score']) / 2  # Genomsnittlig score
                
                # Hoppa över nästa entitet eftersom den nu är sammanfogad
                i += 2
                merged_entities.append(merged)
                continue
        
        # Om ingen sammanslagning gjordes, lägg till den aktuella entiteten
        merged_entities.append(current)
        i += 1
    
    return merged_entities

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
    
    # Sammanslå närliggande entiteter
    merged_entities = merge_nearby_entities(all_entities)
    
    # Ta bort överlappande entiteter (behåll de med högst score)
    filtered_entities = remove_overlapping_entities(merged_entities)
    
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
    
    # Returnera både den censurerade texten och entiteterna för att kunna skapa annoterad version
    return censored_text, filtered_entities

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

def create_censored_info_text(text, entities, personal_data_items=None):
    """
    Skapar en version av texten där identifierade känsliga ord ersätts med
    formatet "Censurerat: 'ord' (entitetstyp) - confidence: score".
    
    Args:
        text: Original text (ocensurerad)
        entities: Lista med NER-entiteter från censurering_text
        personal_data_items: Lista med censurerade personuppgifter från censor_personal_data
        
    Returns:
        Text där känsliga ord är ersatta med beskrivande information
    """
    # Skapa en kopia av originaltexten
    info_text = text
    
    # Positionsjusteringar när vi ersätter ord
    offset = 0
    
    # Samla alla entiteter (NER och personuppgifter)
    all_entities = []
    
    # Lägg till NER-entiteter i listan
    for entity in entities:
        start = max(0, min(entity['start'], len(text)))
        end = max(0, min(entity['end'], len(text)))
        
        if start >= end:
            continue
        
        word = text[start:end]
        entity_type = entity['entity_group']
        score = entity['score']
        
        all_entities.append({
            'start': start,
            'end': end,
            'word': word,
            'entity_type': entity_type,
            'score': score
        })
    
    # Lägg till personuppgifter i listan om det finns några
    if personal_data_items:
        for item in personal_data_items:
            # Hitta alla förekomster av denna uppgift i texten
            pos = 0
            while True:
                pos = text.find(item, pos)
                if pos == -1:
                    break
                
                all_entities.append({
                    'start': pos,
                    'end': pos + len(item),
                    'word': item,
                    'entity_type': 'PERSONUPPGIFT',
                    'score': 1.0
                })
                
                pos += 1  # Fortsätt söka efter nästa förekomst
    
    # Sortera entiteterna efter position (bakifrån för att undvika indexeringsproblem)
    all_entities.sort(key=lambda x: x['start'], reverse=True)
    
    # Ersätt entiteter med informativ text
    for entity in all_entities:
        start = entity['start']
        end = entity['end']
        word = entity['word']
        entity_type = entity['entity_type']
        score = entity['score']
        
        # Justera positioner baserat på tidigare ändringar
        adjusted_start = start + offset
        adjusted_end = end + offset
        
        # Skapa ersättningstext med beskrivande information
        replacement = f"Censurerat: '{word}' ({entity_type}) - confidence: {score:.2f}"
        
        # Ersätt i texten
        info_text = (
            info_text[:adjusted_start] + 
            replacement + 
            info_text[adjusted_end:]
        )
        
        # Uppdatera offset för nästa ersättning
        offset += len(replacement) - (adjusted_end - adjusted_start)
    
    return info_text

# Mappa NER entitetstyper till PII_TYPES
def map_entity_type_to_pii_type(entity_type):
    """Mappa NER entitetstyper till PII_TYPES som definieras i schemas.ts"""
    mapping = {
        "PER": "name",       # Personer -> namn
        "LOC": "address",    # Platser -> adress
        "ORG": "other",      # Organisationer -> annan
        "MISC": "other",     # Diverse -> annan
        "PERSONUPPGIFT": "other",  # Default för personuppgifter, ändras senare baserat på mönster
        "B-PER": "name",     # För modeller som använder BIO-taggning
        "I-PER": "name",     # För modeller som använder BIO-taggning
        "B-LOC": "address",  # För modeller som använder BIO-taggning
        "I-LOC": "address",  # För modeller som använder BIO-taggning
        "B-ORG": "other",    # För modeller som använder BIO-taggning
        "I-ORG": "other",    # För modeller som använder BIO-taggning
        "B-MISC": "other",   # För modeller som använder BIO-taggning
        "I-MISC": "other"    # För modeller som använder BIO-taggning
    }
    return mapping.get(entity_type, "other")

# Extra regex-mönster för att identifiera specifika PII-typer
def identify_pii_subtype(text, entity_type):
    """Identifiera mer specifika PII-typer baserat på textmönster"""
    # Använd först mappningen från NER entitetstyp till PII_TYPE
    base_type = map_entity_type_to_pii_type(entity_type)
    
    # Om det redan är en mappning för PER eller LOC, använd den
    if base_type in ["name", "address"]:
        return base_type
    
    # E-postadresser
    if re.match(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b', text):
        return "email"
    
    # Telefonnummer (olika format)
    if re.match(r'\b(?:\+46|0)(?:[\s-])?[0-9]{1,3}(?:[\s-])?[0-9]{2,3}(?:[\s-])?[0-9]{2,3}(?:[\s-])?[0-9]{2,3}\b', text):
        return "phone"
    
    # IP-adresser (IPv4)
    if re.match(r'\b(?:\d{1,3}\.){3}\d{1,3}\b', text):
        return "ip"
    
    # IP-adresser (IPv6)
    if re.match(r'\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b', text):
        return "ip"
    
    # Kreditkort
    if re.match(r'\b(?:\d{4}[- ]?){3}\d{4}\b', text):
        return "credit-card"
    
    # Personnummer (hanteras som "other" för att passa PII_TYPES)
    if re.match(r'\b(?:\d{6,8})[-]?\d{4}\b', text):
        return "other"  # Personnummer kategoriseras som "other"
    
    # Personnamn - om texten innehåller vanliga namndelar
    common_names = ["johan", "andersson", "erik", "larsson", "svensson", "marie", "anna", "nils", "olsson", "karlsson"]
    if any(name in text.lower() for name in common_names):
        return "name"
    
    # Adressindikationer
    address_indicators = ["vägen", "gatan", "avenue", "street", "malmö", "stockholm", "göteborg", "köpenhamn", "oslo"]
    if any(indicator in text.lower() for indicator in address_indicators):
        return "address"
    
    # Om vi inte kan identifiera en specifik undertyp, använd den mappade entitetstypen
    return base_type

def extract_entities_from_tagged_text(tagged_text):
    """
    Extrahera entiteter och positioner från den taggade texten där formatet är
    <ord> (score) - vilket säkerställer att vi använder exakt samma positioner
    som i taggningen.
    
    Args:
        tagged_text: Den taggade texten med markerade ord
        
    Returns:
        Lista med entiteter med positioner och ord
    """
    entities = []
    
    # Hitta alla förekomster av taggade ord med regex
    # Format: <ord> (score)
    tagged_pattern = r'<([^>]+)> \(([0-9.]+)\)'
    
    # Försök också matcha en eventuell entitetstyp i taggen - för framtida kompabilitet
    # Format: <ord> (PER) (score) eller liknande
    tagged_pattern_with_type = r'<([^>]+)> \(([A-Z\-_]+)\) \(([0-9.]+)\)'
    
    # Spara originaltexten utan taggningar
    original_text = re.sub(tagged_pattern, r'\1', tagged_text)
    
    # Position offset för att hantera skillnader i längd mellan original och taggad text
    offset = 0
    
    # Försök först hitta taggformat med entitetstyp
    has_entity_types = len(re.findall(tagged_pattern_with_type, tagged_text)) > 0
    
    if has_entity_types:
        # Använd det utökade mönstret som inkluderar entitetstyp
        for match in re.finditer(tagged_pattern_with_type, tagged_text):
            full_match = match.group(0)  # <ord> (entity_type) (score)
            word = match.group(1)        # ordet
            entity_type = match.group(2)  # entitetstypen
            score = float(match.group(3))  # confidence score
            
            # Originalpositionen i den taggade texten
            start_pos_tagged = match.start()
            end_pos_tagged = match.end()
            
            # Justera positioner för att hitta ordet i originaltexten
            start_pos_original = start_pos_tagged - offset
            end_pos_original = start_pos_original + len(word)
            
            # Uppdatera offset för nästa matchning
            offset += len(full_match) - len(word)
            
            # Lägg till entiteten
            entities.append({
                'word': word,
                'score': score,
                'start': start_pos_original,
                'end': end_pos_original,
                'entity_type': entity_type
            })
    else:
        # Använd standardmönstret om det inte finns entitetstyp
        for match in re.finditer(tagged_pattern, tagged_text):
            full_match = match.group(0)  # <ord> (score)
            word = match.group(1)        # ordet
            score = float(match.group(2))  # confidence score
            
            # Originalpositionen i den taggade texten
            start_pos_tagged = match.start()
            end_pos_tagged = match.end()
            
            # Justera positioner för att hitta ordet i originaltexten
            start_pos_original = start_pos_tagged - offset
            end_pos_original = start_pos_original + len(word)
            
            # Uppdatera offset för nästa matchning
            offset += len(full_match) - len(word)
            
            # Bestäm entitetstyp baserat på innehåll
            entity_type = "PER"  # Default till PER som kommer mapppas till "name"
            
            # Försök identifiera typ baserat på innehåll
            if re.match(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b', word):
                entity_type = "PERSONUPPGIFT"  # E-post 
            elif re.match(r'\b(?:\+46|0)(?:[\s-])?[0-9]{1,3}(?:[\s-])?[0-9]{2,3}(?:[\s-])?[0-9]{2,3}(?:[\s-])?[0-9]{2,3}\b', word):
                entity_type = "PERSONUPPGIFT"  # Telefonnummer
            elif re.match(r'\b(?:\d{1,3}\.){3}\d{1,3}\b', word):
                entity_type = "PERSONUPPGIFT"  # IP-adress (IPv4)
            elif re.match(r'\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b', word):
                entity_type = "PERSONUPPGIFT"  # IP-adress (IPv6)
            elif re.match(r'\b(?:\d{4}[- ]?){3}\d{4}\b', word):
                entity_type = "PERSONUPPGIFT"  # Kreditkort
            elif re.match(r'\b(?:\d{6,8})[-]?\d{4}\b', word):
                entity_type = "PERSONUPPGIFT"  # Personnummer
            elif any(word.lower().find(place) >= 0 for place in ['väg', 'gata', 'gatan', 'avenue', 'street', 'malmö', 'stockholm', 'göteborg']):
                entity_type = "LOC"  # Adress om det verkar innehålla platsord
            
            # Lägg till entiteten
            entities.append({
                'word': word,
                'score': score,
                'start': start_pos_original,
                'end': end_pos_original,
                'entity_type': entity_type
            })
    
    return entities, original_text

def generate_redactions_from_tagged(tagged_text):
    """
    Generera redaktioner från taggad text genom att extrahera entiteter och bestämma typ.
    Detta säkerställer att vi använder exakt samma positioner som i taggningen.
    
    Args:
        tagged_text: Den taggade texten med markerade ord
        
    Returns:
        Lista med redaktioner som följer schemas.ts
    """
    entities, original_text = extract_entities_from_tagged_text(tagged_text)
    redactions = []
    
    # För varje identifierad entitet
    for entity in entities:
        word = entity['word']
        score = entity['score']
        start = entity['start']
        end = entity['end']
        entity_type = entity['entity_type']
        
        # Identifiera PII-typ baserat på entitetstyp och innehåll i ordet
        pii_type = identify_pii_subtype(word, entity_type)
        
        # Skapa ett Redaction-objekt som matchar schemas.ts
        redaction = {
            "id": str(uuid.uuid4()),  # Generera ett unikt ID
            "type": pii_type,
            "confidence": score,
            "start": start,
            "end": end,
            "replacement": "*" * len(word),  # Ersättning med asterisker
            "text": word  # Det ursprungliga ordet som censureras
        }
        
        redactions.append(redaction)
        
    return redactions, original_text

def main(pdf_path=None):
    # 1. Konvertera PDF till text
    print("\n=== STEG 1: PDF-KONVERTERING ===")
    
    # Om pdf_path inte är specificerad, använd default
    if pdf_path is None:
        pdf_path = Path("3.pdf")  # Använd relativ sökväg till filen i aktuell mapp
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
        
        # 2. Skapa en lista med alla ord som ska censureras/taggas
        print("\n=== STEG 2: IDENTIFIERA PERSONUPPGIFTER OCH ENTITETER ===")
        
        # Lista för att hålla alla positioner och ord som ska censureras
        censoring_plan = []
        
        # 2a. Identifiera personuppgifter först
        # Detta innebär att vi letar efter personuppgifter i originaltexten
        personal_data = []
        
        # E-postadresser
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b'
        for match in re.finditer(email_pattern, plain_text):
            personal_data.append({
                'start': match.start(),
                'end': match.end(),
                'word': match.group(0),
                'entity_type': 'PERSONUPPGIFT',
                'score': 1.0
            })
        
        # Telefonnummer (svenska format)
        phone_patterns = [
            r'\b(?:\+46|0)(?:[\s-])?7[0-9](?:[\s-])?[0-9]{3}(?:[\s-])?[0-9]{2}(?:[\s-])?[0-9]{2}\b',  # Mobilnummer
            r'\b(?:\+46|0)(?:[\s-])?[1-9][0-9]{0,2}(?:[\s-])?[0-9]{3}(?:[\s-])?[0-9]{2}(?:[\s-])?[0-9]{2}\b',  # Fasta nummer
            r'\b(?:\+46|0)(?:[\s-])?[1-9](?:[\s-])?[0-9]{2}(?:[\s-])?[0-9]{3}(?:[\s-])?[0-9]{2}(?:[\s-])?[0-9]{2}\b',  # Växel/företag
        ]
        
        for pattern in phone_patterns:
            for match in re.finditer(pattern, plain_text):
                personal_data.append({
                    'start': match.start(),
                    'end': match.end(),
                    'word': match.group(0),
                    'entity_type': 'PERSONUPPGIFT',
                    'score': 1.0
                })
        
        # Personnummer
        personal_id_patterns = [
            r'\b[1-2][0-9]{3}(?:0[1-9]|1[0-2])(?:0[1-9]|[1-2][0-9]|3[0-1])[-]?[0-9]{4}\b',  # ÅÅÅÅMMDD-XXXX
            r'\b(?:[0-9]{2})(?:0[1-9]|1[0-2])(?:0[1-9]|[1-2][0-9]|3[0-1])[-]?[0-9]{4}\b',   # ÅÅMMDD-XXXX
        ]
        
        for pattern in personal_id_patterns:
            for match in re.finditer(pattern, plain_text):
                personal_data.append({
                    'start': match.start(),
                    'end': match.end(),
                    'word': match.group(0),
                    'entity_type': 'PERSONUPPGIFT',
                    'score': 1.0
                })
        
        # IP-adresser (IPv4)
        ip_v4_pattern = r'\b(?:\d{1,3}\.){3}\d{1,3}\b'
        for match in re.finditer(ip_v4_pattern, plain_text):
            personal_data.append({
                'start': match.start(),
                'end': match.end(),
                'word': match.group(0),
                'entity_type': 'PERSONUPPGIFT',
                'score': 1.0
            })
        
        # IP-adresser (IPv6)
        ip_v6_pattern = r'\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b'
        for match in re.finditer(ip_v6_pattern, plain_text):
            personal_data.append({
                'start': match.start(),
                'end': match.end(),
                'word': match.group(0),
                'entity_type': 'PERSONUPPGIFT',
                'score': 1.0
            })
        
        # Kreditkort (förenklade mönster för vanliga format)
        credit_card_pattern = r'\b(?:\d{4}[- ]?){3}\d{4}\b'
        for match in re.finditer(credit_card_pattern, plain_text):
            personal_data.append({
                'start': match.start(),
                'end': match.end(),
                'word': match.group(0),
                'entity_type': 'PERSONUPPGIFT',
                'score': 1.0
            })
        
        # Lägg till personuppgifter i censurerings-planen
        censoring_plan.extend(personal_data)
        
        if personal_data:
            print(f"Hittade {len(personal_data)} personuppgifter:")
            for i, item in enumerate(personal_data[:5]):  # Visa max 5 exempel
                print(f"  - '{item['word']}'")
            if len(personal_data) > 5:
                print(f"  ...och {len(personal_data) - 5} till")
        else:
            print("Inga personuppgifter hittades med regex-sökning.")
        
        # 2b. Kör NER för att identifiera entiteter
        print("\n=== STEG 3: NER-ANALYS ===")
        ner_pipeline = create_ner_pipeline()
        
        # Dela texten i mindre bitar för att hantera långa texter
        # och identifiera entiteter
        all_entities = []
        chunk_size = 512
        stride = 384  # Överlappning mellan chunks
        
        # Behandla texten i överlappande fönster
        for i in range(0, len(plain_text), stride):
            chunk = plain_text[i:i+chunk_size]
            chunk_start = i
            
            if not chunk.strip():  # Hoppa över tomma chunks
                continue
            
            # Kör NER på den aktuella chunken
            entities = ner_pipeline(chunk)
            
            # Spara bara entiteter med tillräckligt hög confidence
            for e in entities:
                if e['score'] >= 0.7:  # Använd tröskelvärde 0.7
                    # Justera start/end positioner relativt till hela texten
                    e['start'] += chunk_start
                    e['end'] += chunk_start
                    all_entities.append(e)
        
        # Sammanslå närliggande entiteter och ta bort överlapp
        merged_entities = merge_nearby_entities(all_entities)
        filtered_entities = remove_overlapping_entities(merged_entities)
        
        # Lägg till NER-entiteter i censurerings-planen
        for entity in filtered_entities:
            start = max(0, min(entity['start'], len(plain_text)))
            end = max(0, min(entity['end'], len(plain_text)))
            
            if start >= end:
                continue  # Ogiltig position
                
            word = plain_text[start:end]
            censoring_plan.append({
                'start': start,
                'end': end,
                'word': word,
                'entity_type': entity['entity_group'],
                'score': entity['score']
            })
            
            # Skriv ut vad som censurerades (för debugging)
            print(f"Identifierat: '{word}' ({entity['entity_group']}) - confidence: {entity['score']:.2f}")
        
        # 3. Skapa den censurerade och taggade texten från samma censurerings-plan
        print("\n=== STEG 4: CENSURERING OCH TAGGNING ===")
        
        # Ta bort överlappande enheter genom att sortera efter score och sedan position
        censoring_plan.sort(key=lambda x: (-x['score'], x['start']))
        
        # Lista för att hålla reda på vilka områden som redan är "täckta"
        covered_ranges = []
        filtered_plan = []
        
        for item in censoring_plan:
            start = item['start']
            end = item['end']
            
            # Kontrollera om denna position överlappar med någon redan täckt
            overlap = False
            for cstart, cend in covered_ranges:
                # Om det finns någon överlappning
                if (start <= cend and end >= cstart):
                    overlap = True
                    break
            
            if not overlap:
                filtered_plan.append(item)
                covered_ranges.append((start, end))
        
        # Sortera planen efter position (bakifrån för att undvika indexförskjutningar)
        filtered_plan.sort(key=lambda x: x['start'], reverse=True)
        
        # Skapa både censurerad och taggad text i en operation
        censored_text = plain_text
        tagged_text = plain_text
        
        # Applicera censurering och taggning
        for item in filtered_plan:
            start = item['start']
            end = item['end']
            word = item['word']
            
            # Skapa ersättningar
            censored = '*' * len(word)  # Censurerad version (stjärnor)
            
            # Taggad version med både entitetstyp och confidence score
            tagged = f"<{word}> ({item['entity_type']}) ({item['score']:.2f})"
            
            # Ersätt i respektive version
            censored_text = censored_text[:start] + censored + censored_text[end:]
            tagged_text = tagged_text[:start] + tagged + tagged_text[end:]
            
            # Logga för användaren
            print(f"Censurerat/taggat: '{word}' ({item['entity_type']}) - confidence: {item['score']:.2f}")
        
        # 4. Generera JSON-redaktioner från taggad text
        print("\n=== STEG 4.5: GENERERA JSON-REDAKTIONER ===")
        
        # Extrahera redaktioner direkt från taggad text för att säkerställa
        # att vi använder exakt samma positioner och ord
        redactions, extracted_text = generate_redactions_from_tagged(tagged_text)
        
        # Visa information om extraherade redaktioner
        print(f"Extraherade {len(redactions)} redaktioner från taggad text")
        
        # 5. Skapa censurerad markdown också
        # Extrahera text från markdown
        from bs4 import BeautifulSoup
        
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
        
        markdown_censored = markdown_text
        markdown_plain = extract_plain_text_from_markdown(markdown_text)
        
        # För varje censurerat ord, försök censurerad det i markdown också
        for item in filtered_plan:
            word = item['word']
            if len(word) >= 3:  # Bara ersätt ord som är minst 3 tecken
                markdown_censored = markdown_censored.replace(word, '*' * len(word))
        
        # 6. Spara resultaten
        print("\n=== STEG 5: SPARA RESULTAT ===")
        
        # Basera utfilnamn på infilnamnet
        base_name = pdf_path.stem
        
        # Spara originaltexten
        original_path = f"resultat_{base_name}_original.txt"
        with open(original_path, "w", encoding="utf-8") as f:
            f.write(plain_text)
        
        # Spara den censurerade texten
        censored_path = f"resultat_{base_name}_censurerad.txt"
        with open(censored_path, "w", encoding="utf-8") as f:
            f.write(censored_text)
        
        # Spara original markdown
        original_md_path = f"resultat_{base_name}_original.md"
        with open(original_md_path, "w", encoding="utf-8") as f:
            f.write(markdown_text)
        
        # Spara censurerad markdown
        censored_md_path = f"resultat_{base_name}_censurerad.md"
        with open(censored_md_path, "w", encoding="utf-8") as f:
            f.write(markdown_censored)
        
        # Spara taggad version
        tagged_path = f"resultat_{base_name}_taggad.txt"
        with open(tagged_path, "w", encoding="utf-8") as f:
            f.write(tagged_text)
        
        # Spara JSON med redaktioner
        import json
        json_path = f"resultat_{base_name}_redactions.json"
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(redactions, f, ensure_ascii=False, indent=2)
        
        # 7. Visa exempelutdrag
        print("\nExempel på censurerad text:")
        print("-" * 50)
        print(censored_text[:500] + "..." if len(censored_text) > 500 else censored_text)
        print("-" * 50)
        
        print("\nExempel på taggad text:")
        print("-" * 50)
        print(tagged_text[:500] + "..." if len(tagged_text) > 500 else tagged_text)
        print("-" * 50)
        
        # Visa JSON-exempel på det exakta formatet
        print("\nExempel på JSON redaktioner:")
        print("-" * 50)
        if redactions:
            example_json = json.dumps(redactions[:3], indent=2, ensure_ascii=False)
            print(example_json + "..." if len(redactions) > 3 else example_json)
        else:
            print("Inga redaktioner hittades.")
        print("-" * 50)
        
        print(f"\nResultat sparade till:")
        print(f"- Text: '{original_path}' och '{censored_path}'")
        print(f"- Markdown: '{original_md_path}' och '{censored_md_path}'")
        print(f"- Taggad: '{tagged_path}'")
        print(f"- JSON: '{json_path}'")
        
        return {
            "original_text": plain_text,
            "censored_text": censored_text,
            "original_markdown": markdown_text,
            "censored_markdown": markdown_censored,
            "tagged_text": tagged_text,
            "redactions": redactions,
            "files": [original_path, censored_path, original_md_path, censored_md_path, tagged_path, json_path]
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
        print("Använder standardfil: CV.pdf")
        main()
    
    print("\nCensureringsprocessen är klar!") 