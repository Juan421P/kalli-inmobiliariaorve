import { useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import {
    Calendar, ChevronDown, DollarSign, FileText, Home, HelpCircle, Mail,
    MessageCircle, Phone, Search, User,
} from 'lucide-react-native';
import Chip from '@/components/ui/Chip';
import { colors, spacing, fontSize, radius } from '@/styles/theme';

const CATEGORIES = [
    { key: 'all', label: 'Todas', icon: HelpCircle },
    { key: 'buy', label: 'Comprar', icon: Home },
    { key: 'rent', label: 'Alquilar', icon: Home },
    { key: 'schedule', label: 'Citas', icon: Calendar },
    { key: 'offer', label: 'Ofertas', icon: DollarSign },
    { key: 'account', label: 'Mi cuenta', icon: User },
    { key: 'docs', label: 'Documentos', icon: FileText },
];

const FAQS = [
    { category: 'buy', question: '¿Cuáles son los pasos para comprar una propiedad?', answer: 'El proceso es: (1) Busca la propiedad en nuestra plataforma. (2) Agenda una cita para visitarla. (3) Haz una oferta si te interesa. (4) Un asesor te contactará para coordinar la negociación. (5) Se firma la promesa de venta y luego la escritura pública ante notario.' },
    { category: 'buy', question: '¿Puedo comprar una propiedad si necesito financiamiento?', answer: 'Sí. Al agendar una cita o hacer una oferta, puedes indicar que financiarás la compra con un préstamo bancario. Nuestros asesores pueden orientarte con los bancos con los que trabajamos y los requisitos habituales.' },
    { category: 'buy', question: '¿Cuánto cuesta el proceso de compra (honorarios, notaría)?', answer: 'Los honorarios notariales en El Salvador varían entre el 1 % y el 2 % del valor de la propiedad. Adicionalmente hay impuestos de transferencia (IVA 13 % sobre las ganancias del vendedor y derechos de registro). Te asesoramos en detalle durante el proceso.' },
    { category: 'rent', question: '¿Qué documentos necesito para alquilar una propiedad?', answer: 'Generalmente se requiere: DUI o pasaporte vigente, constancia de ingresos (colilla del ISSS o carta de trabajo), referencias personales o laborales, y en algunos casos un fiador. Los requisitos exactos los define el propietario.' },
    { category: 'rent', question: '¿El depósito de garantía es reembolsable?', answer: 'Sí, siempre que la propiedad se entregue en las mismas condiciones en que se recibió. El monto del depósito y las condiciones de devolución quedan establecidos en el contrato de arrendamiento.' },
    { category: 'rent', question: '¿Puedo negociar el canon mensual de alquiler?', answer: 'En muchos casos sí. Al hacer tu oferta puedes proponer un monto diferente al publicado. El propietario decidirá si acepta, rechaza o contraoferta. Un asesor te ayudará a mediar la negociación.' },
    { category: 'schedule', question: '¿Cómo agendo una visita a una propiedad?', answer: 'Ingresa a la propiedad que te interesa, toca "Agendar cita", elige una fecha y hora disponible, completa los datos solicitados y envía la solicitud. Recibirás confirmación por el método de contacto que elegiste.' },
    { category: 'schedule', question: '¿Puedo reagendar o cancelar una cita?', answer: 'Sí. Desde tu perfil puedes ver tus citas próximas. Te recomendamos avisar con al menos 24 horas de anticipación.' },
    { category: 'schedule', question: '¿Cuánto dura una visita a una propiedad?', answer: 'Las visitas tienen una duración aproximada de 30 a 45 minutos, dependiendo del tamaño de la propiedad y las consultas que tengas. Un asesor de ORVE te acompañará durante toda la visita.' },
    { category: 'offer', question: '¿Cómo funciona el proceso de oferta?', answer: 'Desde la página de la propiedad toca "Hacer una oferta", ingresa el monto que propones y completa el formulario. Un asesor revisará tu oferta y la presentará al propietario, quien podrá aceptarla, rechazarla o hacer una contraoferta.' },
    { category: 'offer', question: '¿Mi oferta tiene algún costo o compromiso inmediato?', answer: 'No. Enviar una oferta no implica ningún pago inmediato ni compromiso legal. Solo representa tu intención de compra. El compromiso formal ocurre al firmar la promesa de venta.' },
    { category: 'offer', question: '¿Cuánto tiempo tarda el propietario en responder una oferta?', answer: 'El plazo varía, pero nuestro equipo hace seguimiento activo para obtener una respuesta en un máximo de 48–72 horas hábiles desde que se presenta la oferta.' },
    { category: 'account', question: '¿Cómo cambio mi contraseña?', answer: 'Ve a tu perfil → "¿Olvidó su contraseña?" en la pantalla de inicio de sesión. Recibirás un código de verificación en tu correo electrónico. Ingrésalo junto con tu nueva contraseña para confirmar el cambio.' },
    { category: 'account', question: '¿Cómo actualizo mis datos personales?', answer: 'En tu perfil, toca "Editar datos" para actualizar nombre, apellido y teléfono.' },
    { category: 'account', question: '¿Puedo eliminar mi cuenta?', answer: 'Sí. Contáctanos por WhatsApp o correo para procesar la eliminación. Esta acción es permanente e irreversible. Si tienes citas o procesos activos, te recomendamos contactarnos antes.' },
    { category: 'docs', question: '¿Qué documentos se necesitan para la escritura de compraventa?', answer: 'Generalmente: DUI o pasaporte del comprador y vendedor, solvencia de impuestos municipales de la propiedad, planos actualizados, y el contrato de promesa de venta si existe. El notario te indicará la lista exacta.' },
    { category: 'docs', question: '¿ORVE me ayuda con el trámite de escritura?', answer: 'Sí. Trabajamos con notarios de confianza que pueden acompañarte durante todo el proceso legal. Podemos coordinar la gestión documental para que la experiencia sea lo más sencilla posible.' },
];

const CONTACT = [
    { icon: MessageCircle, label: 'WhatsApp', value: '+503 2270-2561', desc: 'Lun a Sáb · 8:00–18:00', action: 'https://wa.me/50322702561' },
    { icon: Phone, label: 'Teléfono', value: '+503 2270-2561', desc: 'Lun a Vie · 8:00–17:00', action: 'tel:+50322702561' },
    { icon: Mail, label: 'Correo', value: 'hola@orve.com.sv', desc: 'Respondemos en menos de 24 h', action: 'mailto:hola@orve.com.sv' },
];

const HelpScreen = () => {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [openIndex, setOpenIndex] = useState(null);

    const filtered = useMemo(() => {
        let list = FAQS;
        if (category !== 'all') list = list.filter((f) => f.category === category);
        const q = search.toLowerCase().trim();
        if (q) list = list.filter((f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
        return list;
    }, [search, category]);

    return (
        <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
            <View style={styles.hero}>
                <View style={styles.heroIcon}><HelpCircle size={26} color={colors.orveTeal} /></View>
                <Text style={styles.heroTitle}>Centro de ayuda</Text>
                <Text style={styles.heroSubtitle}>¿En qué podemos ayudarte hoy?</Text>
            </View>

            <View style={styles.searchBar}>
                <Search size={16} color={colors.textFaint} />
                <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder='Buscar en preguntas frecuentes...'
                    placeholderTextColor={colors.textFaint}
                    style={styles.searchInput}
                />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                {CATEGORIES.map(({ key, label, icon }) => (
                    <Chip key={key} label={label} icon={icon} selected={category === key} onPress={() => setCategory(key)} />
                ))}
            </ScrollView>

            {filtered.length === 0 ? (
                <View style={styles.emptyWrap}>
                    <HelpCircle size={32} color={colors.textFaint} />
                    <Text style={styles.emptyTitle}>Sin resultados</Text>
                    <Text style={styles.emptySubtitle}>Probá con otras palabras o categoría.</Text>
                </View>
            ) : (
                <View style={styles.faqList}>
                    {filtered.map((faq, i) => {
                        const open = openIndex === i;
                        return (
                            <View key={faq.question} style={[styles.faqItem, open && styles.faqItemOpen]}>
                                <Pressable style={styles.faqHeader} onPress={() => setOpenIndex(open ? null : i)}>
                                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                                    <ChevronDown
                                        size={16}
                                        color={colors.textFaint}
                                        style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
                                    />
                                </Pressable>
                                {open ? <Text style={styles.faqAnswer}>{faq.answer}</Text> : null}
                            </View>
                        );
                    })}
                </View>
            )}

            <View style={styles.contactSection}>
                <Text style={styles.contactTitle}>¿No encontraste lo que buscabas?</Text>
                <Text style={styles.contactSubtitle}>Nuestro equipo está disponible para ayudarte directamente.</Text>
                <View style={styles.contactGrid}>
                    {CONTACT.map(({ icon: Icon, label, value, desc, action }) => (
                        <Pressable key={label} style={styles.contactCard} onPress={() => Linking.openURL(action)}>
                            <Icon size={22} color={colors.orveTeal} />
                            <Text style={styles.contactLabel}>{label}</Text>
                            <Text style={styles.contactValue}>{value}</Text>
                            <Text style={styles.contactDesc}>{desc}</Text>
                        </Pressable>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
    hero: { alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
    heroIcon: {
        width: 52, height: 52, borderRadius: radius.xl, backgroundColor: 'rgba(80,113,119,0.1)',
        alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs,
    },
    heroTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.orveDarkerTeal },
    heroSubtitle: { fontSize: fontSize.sm, color: colors.textMuted },
    searchBar: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
        backgroundColor: colors.white, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    },
    searchInput: { flex: 1, fontSize: fontSize.sm, color: colors.orveBlack },
    chipsRow: { gap: spacing.sm, paddingVertical: spacing.xs },
    emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl, gap: spacing.xs },
    emptyTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.textMuted },
    emptySubtitle: { fontSize: fontSize.sm, color: colors.textFaint },
    faqList: { gap: spacing.sm },
    faqItem: { backgroundColor: colors.white, borderRadius: radius.lg, overflow: 'hidden' },
    faqItemOpen: { borderWidth: 1, borderColor: colors.border },
    faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, padding: spacing.md },
    faqQuestion: { flex: 1, fontSize: fontSize.sm, fontWeight: '600', color: colors.orveDarkerTeal },
    faqAnswer: { fontSize: fontSize.sm, color: colors.textMuted, paddingHorizontal: spacing.md, paddingBottom: spacing.md, lineHeight: 20 },
    contactSection: { marginTop: spacing.lg, gap: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.lg },
    contactTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.orveDarkerTeal, textAlign: 'center' },
    contactSubtitle: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center' },
    contactGrid: { flexDirection: 'row', gap: spacing.sm },
    contactCard: {
        flex: 1, alignItems: 'center', gap: spacing.xs, padding: spacing.md,
        backgroundColor: colors.white, borderRadius: radius.lg,
    },
    contactLabel: { fontSize: fontSize.sm, fontWeight: '700', color: colors.orveDarkerTeal },
    contactValue: { fontSize: fontSize.xs, fontWeight: '600', color: colors.orveTeal, textAlign: 'center' },
    contactDesc: { fontSize: 10, color: colors.textFaint, textAlign: 'center' },
});

export default HelpScreen;
